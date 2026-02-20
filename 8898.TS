{
    label: 'Hardware T&E: TV Components',
    items: [
        {
            label: 'Power & PSU Analysis',
            icon: 'pi pi-bolt',
            routerLink: ['/te/power-supply'],
            items: [
                { label: 'PSU Processor Logic', routerLink: ['/dashboard/test/psu'] },
                { label: 'Voltage Converters', routerLink: ['/dashboard/test/converter'] }
            ]
        },
        {
            label: 'Image Pipeline',
            icon: 'pi pi-desktop',
            routerLink: ['/te/image-chain'],
            items: [
                { label: 'T-Con Calibration', routerLink: ['/te/t-con'] },
                { label: 'LVDS Signal Integrity', routerLink: ['/te/lvds-data'] },
                { label: 'Panel/Cell Inspection', routerLink: ['/te/panel-test'] }
            ]
        },
        {
            label: 'Compatibility Lab',
            icon: 'pi pi-share-alt',
            items: [
                { label: 'LVDS-to-Panel Mapping', routerLink: ['/te/mapping'] },
                { label: 'PSU-to-Mainboard Power Rail', routerLink: ['/te/power-rails'] },
                { label: 'Remote Code Library', routerLink: ['/te/remote-codes'] }
            ]
        },
        {
            label: 'Smart Diagnostics',
            icon: 'pi pi-question-circle',
            items: [
                { label: 'Start Symptom Flow', routerLink: ['/diag/symptoms'] },
                { label: 'Voltage Reference Charts', routerLink: ['/diag/voltages'] },
                { label: 'Failure Statistics', routerLink: ['/diag/stats'] }
            ]
        },
        // 2. LOGIC & PROCESSING (Motherboards)
        {
            label: 'Mainboard / SoC',
            icon: 'pi pi-microchip',
            routerLink: ['/te/motherboard-eval'],
            tooltip: 'SoC thermals and port validation'
        },
        // 3. IMAGE PATHWAY (T-Con, LVDS, Panels)
        // 4. LIGHTING (LED Backlights)
        {
            label: 'Backlight Units (BLU)',
            icon: 'pi pi-sun',
            routerLink: ['/te/led-backlight'],
            tooltip: 'Current draw and color temperature'
        },
        // 5. PERIPHERALS (Remotes & Accessories)
        {
            label: 'Remote & Accessories',
            icon: 'pi pi-wifi',
            routerLink: ['/te/peripherals'],
            tooltip: 'IR/Bluetooth pairing and cable durability'
        }
    ]
},
