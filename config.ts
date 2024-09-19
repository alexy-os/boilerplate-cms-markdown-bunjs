export const config = {
    port: 3700,
    defaultPage: 'home',
    dbFileName:  'pages.mdb',
    dbDirectory: 'database',
    contentDirectory: 'content',
    publicDirectory:  'public',
    layoutFile: 'views/layout.html',
    staticDirs: [
        { urlPrefix: '/js',  dir: 'public/js' },
        { urlPrefix: '/css', dir: 'public/css' },
        { urlPrefix: '/img', dir: 'public/images' },
    ],
    options: [
        { isEngine: true, saveDb: false },
    ]
};