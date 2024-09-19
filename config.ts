export const config = {
    port: 5000,
    dbFileName: 'base.mdb',
    dbDirectory: 'data',
    contentDirectory: 'content',
    publicDirectory: 'public',  // Добавим это
    layoutFile: 'views/layout.html',
    defaultPage: 'home',
    staticDirs: [
        { urlPrefix: '/js', dir: 'public/js' },
        { urlPrefix: '/css', dir: 'public/css' },
        { urlPrefix: '/img', dir: 'public/images' },
    ],
};