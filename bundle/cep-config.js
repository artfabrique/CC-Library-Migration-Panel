module.exports =
{
    bundle: {
        version: '0.1.0',
        id: 'com.me.Revenga.CCLibraryMigration',
        name: 'CCLibraryMigration',
        author_name: 'Alexander Vinogradov',
        description: 'Adobe Creative Cloud Libraries Tool to batch-fix broken Adobe Creative Cloud Library elements links in the PSD file',
        ui_access: 'You can run this extension by choosing<br><b>Window &gt; Extensions &gt; CCLibraryMigration.</b>',
    },

    extensions: [{
        version: '0.1.0',
        id: 'com.me.Revenga.CCLibraryMigration.panel',
        name: 'CCLibraryMigration',
        main_path: 'me.revenga.cclibrarymigration.html',
        script_path: 'extendscript/me.revenga.cclibrarymigration.jsx',
        icons: {
            light: {
                normal: 'icons/icon-light.png',
                hover: 'icons/icon-light-hover.png',
                disabled: 'icons/icon-light-disabled.png'
            },
            dark: {
                normal: 'icons/icon-dark.png',
                hover: 'icons/icon-dark-hover.png',
                disabled: 'icons/icon-dark-disabled.png'
            },
        },
        manifest: 'bundle/manifest.extension.xml',
    }],

    builds: [
        // CC2015, CC2015.5 and CC2017
        {
            bundle: { manifest: 'bundle/manifest.bundle.cc2015.xml' },
            products: ["photoshop"],
            source: 'src',
            families: ['CC2017', 'CC2015.5', 'CC2015'],
        },
        // CC and CC2014
        {
            bundle: { manifest: 'bundle/manifest.bundle.cc.xml' },
            products: ["photoshop"],
            source: 'src',
            families: ['CC2014', 'CC'],
        }
    ],
};
