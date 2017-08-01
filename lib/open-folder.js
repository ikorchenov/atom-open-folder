'use babel';

import {CompositeDisposable} from 'atom';

export default {
    subscriptions: null,

    activate(state) {
         function calcPaths() {
            const
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
                    dir.classList.add('open-folder');
                } else {
                    dir.classList.remove('open-folder');
                }
            }
        };

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

        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(
          atom.workspace.onDidDestroyPaneItem(eventHandler),
          atom.workspace.onDidAddPaneItem(eventHandler),
          atom.packages.onDidActivatePackage(calcOnTreeView)
        );
    },

    deactivate() {
        this.subscriptions.dispose();
    }
};
