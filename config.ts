export const config = {
    port: 3000,
    dbFileName: 'pages.mdb',
    dbDirectory: 'database',
    contentDirectory: 'content',
    publicDirectory: 'public',
    layoutFile: 'views/layout.html',
    defaultPage: 'home',
    staticDirs: [
        { urlPrefix: '/js', dir: 'public/js' },
        { urlPrefix: '/css', dir: 'public/css' },
        { urlPrefix: '/img', dir: 'public/images' },
    ],
};