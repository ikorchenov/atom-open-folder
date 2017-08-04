'use babel';

import {CompositeDisposable} from 'atom';

export default {
    subscriptions: null,
    config: {
        style: {
            type: 'string',
            default: 'underline',
            enum: [
                {value: '', description: 'None'},
                {value: 'underline', description: 'Underline'},
                {value: 'short-underline', description: 'Short underline'},
                {value: 'dot', description: 'Dot'},
                {value: 'shadow', description: 'Shadow'}
            ]
        },
        color: {
            type: 'string',
            default: 'yellow',
            enum: [
                {value: 'yellow', description: 'Yellow'},
                {value: 'red', description: 'Red'},
                {value: 'lightblue', description: 'Light blue'}
            ]
        },
        file: {
            type: 'boolean',
            default: false,
            description: 'Highlight files'
        }
    },

    activate(state) {
        const className = 'open-folder';

        function calcPaths() {
            const
                style = atom.config.get('open-folder.style'),
                color = atom.config.get('open-folder.color'),
                file = atom.config.get('open-folder.file'),
                paths = {},
                tabs = document.querySelectorAll('.tab-bar[location="center"]'),
                selector = file ? '.icon.name' : '.icon-file-directory[data-path]',
                dirs = document.querySelectorAll(selector);

            for (let tab of tabs) {
                for (let file of tab.children) {
                    const path = file.querySelector('.title').dataset['path'];

                    if (typeof path === 'string') {
                        if (file) {
                            paths[path] = true;
                        } else {
                            paths[path.replace(/\\[^\\]+?$/, '')] = true;
                        }
                    }
                }
            }

            for (let currentPath in paths) {
                for (let path in paths) {
                    if (currentPath.length > path.length && currentPath.slice(0, path.length) === path) {
                        paths[path] = false;
                    }
                }
            }

            for (let path in paths) {
                if (paths[path]) {
                    const fullPath = path.split('\\');
                    let prevPath = '';

                    fullPath.forEach(function (p) {
                        prevPath += prevPath.length ? '\\' + p : p;
                        paths[prevPath] = true;
                    });
                }
            }

            for (let dir of dirs) {
                if (paths[dir.dataset.path]) {
                    dir.classList.add(className, color);

                    if (style) {
                        dir.classList.add(style);
                    }
                } else {
                    dir.classList.remove(className, color);

                    if (style) {
                        dir.classList.remove(style);
                    }
                }
            }
        }

        function eventHandler(e) {
            if (atom.workspace.isTextEditor(e.item)) {
                return calcPaths();
            }
        }

        function calcOnTreeView(package) {
            if (package.name === 'tree-view') {
                calcPaths();
            }
        }

        const replaceStyle = (styleClass) => {
            const activeDirs = document.querySelectorAll('.' + className);

            for (let dir of activeDirs) {
                this.config.style.enum.forEach(style => {
                    if (style.value) {
                        dir.classList.remove(style.value);
                    }
                });

                if (styleClass) {
                    dir.classList.add(styleClass);
                }
            }
        };

        const replaceColor = (colorClass) => {
            const activeDirs = document.querySelectorAll('.' + className);

            for (let dir of activeDirs) {
                this.config.color.enum.forEach(color => {
                    dir.classList.remove(color.value);
                });

                dir.classList.add(colorClass);
            }
        };

        const toggleFileHighlighting = (file) => {
            if (file) {
                calcPaths();
            } else {
                const activeDirs = document.querySelectorAll('.' + className);

                for (let dir of activeDirs) {
                    dir.classList.remove(className);
                    calcPaths();
                }
            }
        };

        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(
            atom.workspace.onDidDestroyPaneItem(eventHandler),
            atom.workspace.onDidAddPaneItem(eventHandler),
            atom.packages.onDidActivatePackage(calcOnTreeView),
            atom.config.observe('open-folder.style', replaceStyle),
            atom.config.observe('open-folder.color', replaceColor),
            atom.config.observe('open-folder.file', toggleFileHighlighting)
        );

        calcPaths();
    },

    deactivate() {
        this.subscriptions.dispose();
    }
};
