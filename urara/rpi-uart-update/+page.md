---
title: Flash ATmega2560 from RPI over UART
summary: Firmware updates with using a DTR-to-reset capacitor trick to trigger the bootloader.
created: 2026-09-13
updated: 2026-09-13
tags: ['C/C++', 'Raspberry Pi']
toc: true
---

# Why reset an ATmega board from RPI?
Normally we use USB for communication between our embedded board and a RPI. But recently we come across a problem with the older Pi versions, specifically RPI3B. 

Our embedded board uses CH341 for the USB to serial conversion. We build dental simulation machines that needs to work for weeks. During that time the board manages heaters, a HVAC system, stepper motors, and sends information about them to UI. The problem is CH341 drops communication after an undetermined amount of time when used with RPI3B. Kernel logs show an error output related to CH341 driver and re-connection attempts. However, re-connection triggers reset on the board which is unacceptable for a machine that is expected to work for weeks. This problem doesn't happen on newer versions of RPI.

The kernel on the RPI3B was new, power input was sufficient. When we tried the same process with official power supply the communication lost is still observed after a while. There was no under-voltage warnings too. Changing the CH341 was not an option at that time, also diving into the driver code seemed too time consuming. Because even I found a bug and fix it, test and validation would take ages since the problem seems to happen randomly. In one case the connection dropped 2 hours after starting operation, another one took 6 hours.

As a quick action, we get rid of the USB by directly connecting RPI's UART to board's UART. Now the communication was working without a problem but there was one small issue. Normally, we were updating the firmware from USB with the RPI, but when we transition to UART we lost that critical ability. 

I have experience from the ST MCUs and I know that they can be flashed from I2C, UART etc. After a quick research I understand that it is possible to it with AVR boards too (Why wouldn't be!). AVR boards require an external programmer or a small hardware trick to trigger the bootloader. For example, using a capacitor on the reset line allows the USB-to-UART adapter to automatically reset the MCU when flashing begins. This enables bootloading. It is typically done by connecting the DTR(Data Terminal Ready) line through a capacitor to the reset pin, so when DTR toggles, it generates a reset pulse. DTR is a control signal from the serial interface used to indicate readiness and can be toggled to trigger a reset on the MCU. Without this, you often need to manually reset the chip or rely on dedicated ISP programming. I went with the DTR trick. Rest of the blog is tutorial on how to perform update over UART.

---
# How it works

The Arduino bootloader on the ATmega2560 listens on UART0 and waits for avrdude to connect after a reset. Normally a USB-UART chip (CH340, CP2102) handles both the serial connection and the reset via its DTR pin. Here we replace that with:

- **RPi ttyAMA0** for the serial connection (TX/RX)
- **RPi GPIO** for the reset signal, triggered at exactly the right moment

The timing problem is that `ttyAMA0` has no physical DTR pin. avrdude toggles DTR in software but nothing happens on any wire. The solution is `avrdude-gpio-autoreset` — a program that watches avrdude's DTR toggle via `strace` and fires GPIO18 at that exact moment.

The reset circuit uses a 1uF capacitor in series. Because the GPIO sits in hi-Z input mode when idle, the capacitor is uncharged. The autoreset program pre-charges it HIGH before pulling LOW to ensure a clean reset pulse. The capacitor is not optional it is required.

---
## Requirements

**Hardware:**
- Raspberry Pi
- MKS Gen L board
- 3.3V ↔ 5V level shifter (RPi is 3.3V, MKS is 5V)
- 1uF ceramic capacitor

**Software:**
- `avrdude`
- `strace`
- `g++`

---
## Wiring

```

Raspberry Pi    MKS Gen L

─────────────── ──────────────────

Pin 8 GPIO14 (TX) ─[level shifter]─ RX0 (pin 1)

Pin 10 GPIO15 (RX) ─[level shifter]─ TX0 (pin 0)

Pin 12 GPIO18 ─[1uF]───────── RESET

GND ──────────────── GND

```
  

> **Important:** The level shifter is required. Connecting 5V signals directly to RPi GPIO will damage it.

> **Important:** The 1uF capacitor between the RPI GPIO pin and RESET pin is NOT optional, it must be there.

---
## RPi UART configuration

Disable Bluetooth so the full PL011 UART is available on GPIO14/15, and disable the serial console so the port is free for avrdude.

Edit `/boot/firmware/config.txt` and add:

```ini

enable_uart=1
dtoverlay=disable-bt

```

Disable the serial console:
```bash

sudo raspi-config

# Interface Options → Serial Port
# "Login shell over serial?" → No
# "Serial port hardware enabled?" → Yes

```

Reboot:
```bash

sudo reboot

```

Verify the UART is free:
```bash

ls -la /dev/serial0 # should point to ttyAMA0
lsof /dev/serial0 # should return nothing

```

---
## Files

```

avrdude-gpio-autoreset.cpp — reset helper program
avrdude — drop-in wrapper script
flash.sh — main flash script

```

  
---
## Build and install  

```bash

# 1. Build the autoreset helper
g++ -std=c++17 -o avrdude-gpio-autoreset avrdude-gpio-autoreset.cpp

# 2. Rename the real avrdude binary
sudo mv /usr/bin/avrdude /usr/bin/avrdude-original

# 3. Install wrapper and helper
sudo cp avrdude-gpio-autoreset /usr/local/bin/
sudo cp avrdude /usr/local/bin/avrdude
sudo chmod +x /usr/local/bin/avrdude /usr/local/bin/avrdude-gpio-autoreset
```

---
## Flash firmware

You can use flash.sh script:
```bash

sudo ./flash.sh firmware.hex

```

Or call avrdude directly:
```bash

sudo avrdude -c wiring -P /dev/serial0 -b 115200 -p atmega2560 -D -U flash:w:firmware.hex:i

```

Expected output:

```

[autoreset] Waiting for avrdude DTR signal (timeout 10s)...
[autoreset] DTR LOW detected
[autoreset] GPIO18 HIGH — pre-charging capacitor
[autoreset] GPIO18 LOW — reset asserted
[autoreset] GPIO18 hi-Z — reset released
[autoreset] Bootloader ready — handoff to avrdude
avrdude-original: AVR device initialized and ready to accept instructions
avrdude-original: device signature = 0x1e9801 (probably m2560)
avrdude-original: reading input file firmware.hex for flash
with 64984 bytes in 1 section within [0, 0xfdd7]
using 254 pages and 40 pad bytes
avrdude-original: writing 64984 bytes flash ...
Writing | ################################################## | 100% 9.77 s
avrdude-original: 64984 bytes of flash written
avrdude-original: verifying flash memory against firmware.hex
Reading | ################################################## | 100% 10.99 s
avrdude-original: 64984 bytes of flash verified
avrdude-original done. Thank you.
[flash] Done.
```

After flashing, the same UART is used for normal communication between the RPi and the MKS board.

# Troubleshooting

**not in sync: resp=0x00**
avrdude receives nothing from the board. Check:

- TX/RX are not swapped (RPi TX → MKS RX0, RPi RX ← MKS TX0)
- Level shifter is connected and powered
- You are connected to UART0 (TX0/RX0), not UART2 or another port
- `/dev/serial0` points to `ttyAMA0` (not `ttyS0`)

**Board does not reset**
Test the reset circuit manually:

```bash

pinctrl set 18 op
pinctrl set 18 dl && sleep 0.1 && pinctrl set 18 dh

```

The board should visibly restart (LEDs flicker). If not, check the capacitor and connection to the RESET pin.

**Port is busy**
```bash

lsof /dev/serial0

```

Stop the thing that is using it.


**Autoreset not triggering**
Verify strace can see avrdude's ioctl calls:
```bash

sudo strace -e ioctl avrdude-original -c wiring -P /dev/serial0 -b 115200 -p atmega2560 2>&1 | grep TIOCMSET

```

You should see lines with `TIOCMSET` toggling `TIOCM_DTR`. If not, avrdude may not be found at `/usr/bin/avrdude-original` — check the path in the wrapper script.


---

# Configuration reference
All tuneable values are at the top of `avrdude-gpio-autoreset.cpp`:

| Variable | Value | Description |
|---|---|---|
| `RST_PIN` | `18` | BCM GPIO pin connected to MKS RESET |
| `GPIO_CHIP` | `/dev/gpiochip0` | GPIO character device |
| `RESET_MS` | `100` | Reset pulse width in milliseconds |
| `SETTLE_MS` | `200` | Wait after reset for bootloader to start |
| `TIMEOUT_SEC` | `10.0` | Abort if no DTR seen within this time |

  
After changing any value, rebuild.

# Code

<script>
  import { Gist } from 'sveltekit-embed'
</script>

<Gist gistUri="lioga/5e89fb3eb3fd4bf33f0945a85a97b1e2" />

[Link](https://gist.github.com/lioga/5e89fb3eb3fd4bf33f0945a85a97b1e2) to GIST.

