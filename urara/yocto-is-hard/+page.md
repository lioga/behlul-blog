---
title: Yocto Is Hard. Everything Else Was Harder
summary: My search for an embedded deployment mechanism I could actually trust.
created: 2026-11-7
updated: 2026-11-7
tags: ['Linux', 'Yocto']
toc: true
---

# Intro
So this is a blog post related to deployment journey of the company I work at, from Windows mini PCs to Ubuntu, to an ARM SBC Stock OS, and finally to Yocto, and every lesson I picked up along the way.

Little background info about the company I work for: we make 3D bio-printers, dental simulator machines (lab machines that simulate chewing and brushing to test dental materials for weeks) and tangential flow filtration devices. I write all the software, firmware and deployment stack.

# Ow no, Windows!
When I first arrived at the company some products have half-ass UI in Qt Widgets and some of the product lines were new and don't have anything. They were sending the machines with mini PCs and portable monitors. Just a start script when Windows starts and full-screen touch screen without an exit button. You probably can do ALT + F4 though xd.  Since releasing a working and reliable app was first thing to do, I didn't want to touch anything related to deployment. 

But after I finished the software, the first thing to do was getting rid of windows. Windows decides when to update, reboot, or pop up dialogs over your app. If you want to disable them you will have lots fun with the registry. I think they have IoT for Windows that you can use it with embedded devices. But either way, you have to pay license fees which we don't want to.

# Ubuntu, Docker, and Ansible
Since I’m not a big fan of Windows or Microsoft (I use Arch, btw), the first thing I did was move the app over to Ubuntu Server. I also wanted every production build to come out identical no matter who produced it, so I packaged the build environment into a Docker image. Also, I  wanted to use Ansible. I was building a homelab at the time and needed an excuse to try it, and it gave me code to rebuild the setup if I ever lost the ISO. I cloned and shrink the disk image with Clonezilla, but it took forever, and I was changing things too fast for that to be practical. The playbooks ended up split into deps, display, splash, app, network and hardening, and together they turn a stock Ubuntu install into a kiosk.

The kiosk itself was X11 duct tape. LightDM autologs into Openbox, `xset` stops the screen from blanking, `xbanish` hides the cursor, and `xrandr` handles rotation. Our screen is vertical, which makes touch input and Qt widgets much harder than they should be, so I wrote an `xinput` touch transform matrix script by hand and matched it to the touchscreen. 

You know it was still much better than windows for me and we were still on mini PCs with Intel N150 which were cheap at the time. But it didn't last long and the ram prices roared. They asked me the find alternatives so I decided to move our stack onto ARM single-board computers. Of course, those PCs were overkill for our machines anyway.

# ARM SBC with Stock OS

We moved to ARM single-board computers, which were cheaper and smaller than the mini PCs we have been using. The catch was that I now had to cross-compile Qt for them, and I did it the hard way. I built my own cross GCC with gcc, glibc and binutils versions matched to the board’s OS. I pulled a 3.1 GB sysroot off a real board and used a Python script to turn its absolute symlinks into relative ones. Qt had to be built twice, once for the host and once for the target. Then the OS needed an upgrade, and I did everything again with a new toolchain, a new sysroot and fresh Qt builds. 

It took me 3-4 days at my first try, and when we need to update OS it took a one whole day to take builds of everything. I want to stress how cumbersome and problematic this was. One time I ran into an issue like this: I use Arch, so my host toolchain is always the latest, and while building an old version of GCC as a cross-compiler for the ARM board, the build got stuck in an infinite loop. I solved it by downgrading my host GCC.

The deployment side was no better, because I was shipping golden images instead of builds. I’d set up a unit by hand, `dd` it off the card, shrink it (15 GB down to 1.7 GB) and compress it with xz. That left a pile of separate images per product per board, with names like `dental2feb25`, `tff9oct25`, `tff26feb26` and `tff12oct26`. None of them could be reproduced. Supporting a new board or a new product meant hand-building another image from scratch. Ansible kept running alongside all this, and it needed a board-specific splash playbook that edited the kernel command line. 

# Yocto to the Rescue
Board change was on the horizon again because of the stock problems we have on Turkey (or worldwide). I was afraid of repeating the whole process again. I decided to rebuild everything on Yocto, and most of the earlier pain went away because the build system now owns the parts I used to do by hand. Yocto produces an SDK installer from the same recipes as the image, so the toolchain and sysroot can’t drift from what’s on the device. There’s one layer tree with a build directory per board and a shared sstate cache, so `bitbake teeth-image` or `tff-image` replaces the golden image per board per product. Bumping Qt from 6.8 to 6.11 meant changing a submodule branch and rebuilding. The products are now a `meta-lua` platform layer with product layers on top instead of copy-pasted setups.

The device itself got simpler too. Qt runs on EGLFS/KMS straight on DRM, so there’s no display server and none of the X11, Openbox and xrandr hacks. I rewrote the code in QML so rotation is in the software. The rootfs is read-only with a separate `/data` partition, which ends my worries about image getting corrupt. Updates went from a gdown script with a five-second rollback to signed per-serial OTA: rclone with a read-only token, a machine-type guard, A/B rootfs slots via tryboot, a healthcheck and a hardware watchdog. Boot also got much faster. On the newest board it dropped from about 20 s to about 10 s wall clock, and kernel time went from 4.3 s to 0.69 s. The image is also much smaller: it went from 1.7 GB to about 150 MB. So when needed, we can now update the whole OS, not just the app.

None of this was free. Yocto has a steep learning curve, long first builds and heavy disk use once you count downloads and sstate. The sharper problem is that you get exactly what you ask for, and nothing warns you when something is missing. Some kernel module wasn’t in the image, so Mesa quietly fell back to software rendering (softpipe) and the UI lagged.

Still, the trade was worth it. The device OS went from something you configure, by hand, with Ansible or by cloning an SD card, to something you build. It’s versioned in git, reproducible, the same across boards and products, I am not afraid to change board, comes with a matching SDK, and updates safely over the air.

