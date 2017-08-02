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
        }
    },

    activate(state) {
        const className = 'open-folder';

        function calcPaths() {
            const
                style = atom.config.get('open-folder.style'),
                color = atom.config.get('open-folder.color'),
                paths = {},
                tabs = document.querySelectorAll('.tab-bar[location="center"]'),
                dirs = document.querySelectorAll('.icon-file-directory[data-path]');

            for (let tab of tabs) {
                for (let file of tab.children) {
                    const path = file.querySelector('.title').dataset['path'];

                    if (typeof path === 'string') {
                        paths[path.replace(/\\[^\\]+?$/, '')] = true;
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

        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(
            atom.workspace.onDidDestroyPaneItem(eventHandler),
            atom.workspace.onDidAddPaneItem(eventHandler),
            atom.packages.onDidActivatePackage(calcOnTreeView),
            atom.config.observe('open-folder.style', replaceStyle),
            atom.config.observe('open-folder.color', replaceColor)
        );

        calcPaths();
    },

    deactivate() {
        this.subscriptions.dispose();
    }
};
