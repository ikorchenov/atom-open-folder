'use babel';

import {CompositeDisposable} from 'atom';

export default {
    subscriptions: null,
    config: {
      className: {
        type: 'string',
        default: 'open-folder',
        title: 'Open folder class name'
      },
      style: {
          type: 'string',
          default: 'line',
          enum: [
            {value: 'line', description: 'Underline'},
            {value: 'dot', description: 'Dot'}
          ]
      }
    },

    activate(state) {
      const
        style = atom.config.get('open-folder.style'),
        className = atom.config.get('open-folder.className');

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
                    dir.classList.add(className, style);
                } else {
                    dir.classList.remove(className, style);
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

        replaceClasses = (styleClass) => {
          const activeDirs = document.querySelectorAll('.' + className);

          for (let dir of activeDirs) {
            this.config.style.enum.forEach(style => {
              dir.classList.remove(style.value);
            });

            dir.classList.add(styleClass);
          }
        }

        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(
          atom.workspace.onDidDestroyPaneItem(eventHandler),
          atom.workspace.onDidAddPaneItem(eventHandler),
          atom.packages.onDidActivatePackage(calcOnTreeView)
        );

        calcPaths();

        atom.config.observe('open-folder.style', replaceClasses);
    },

    deactivate() {
        this.subscriptions.dispose();
    }
};
