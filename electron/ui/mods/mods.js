var {ipcRenderer,shell,remote} = require('electron');
var lib = require('./../../../lib/index');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var greenworks = remote.getGlobal('greenworks');
var dialog = remote.dialog;

var app = angular.module('app', []);

app.component('appIndex', {
    templateUrl: 'mods-index.html',
    controller: function($scope) {
        this.section = 'installed';
        $scope.$on('goto', (event, section, arg) => {
            this.section = section;
            this.arg = arg;
        })
    }
});

app.component('appInstalled', {
    templateUrl: 'installed.html',
    controller: function($scope) {
        this.dirty = false;
        this.toRemove = {};
        this.loading = true;

        greenworks.ugcGetUserItems(greenworks.UGCMatchingType.Items, greenworks.UserUGCListSortOrder.TitleAsc, greenworks.UserUGCList.Subscribed,
            items => {
                this.list = items;
                this.loading = false;
                $scope.$apply();
            },
            err => alert(err));

        this.openServerFolder = function() {
            shell.showItemInFolder(path.resolve(process.cwd(), 'mods.json'));
        };

        this.openWorkshop = () => shell.openExternal('steam://url/SteamWorkshopPage/464350');

        this.goToWorkshopSection = () => $scope.$emit('goto', 'workshop');

        this.openModPage = item => {
            shell.openExternal('http://steamcommunity.com/sharedfiles/filedetails/?id='+item.publishedFileId);
        };

        this.removeMod = item => {

            greenworks.ugcUnsubscribe(item.publishedFileId, () => {
                this.dirty = true;
                $scope.$apply();
            }, err => alert(err));
            this.toRemove[item.publishedFileId] = true;

        }
    }
});

app.component('appWorkshop', {
    templateUrl: 'workshop.html',
    controller: function($scope) {
        this.loading = true;

        greenworks.ugcGetUserItems(greenworks.UGCMatchingType.Items, greenworks.UserUGCListSortOrder.TitleAsc, greenworks.UserUGCList.Published,
            items => {
                this.list = items;
                this.loading = false;
                $scope.$apply();
            },
            err => alert(err));

        this.goToInstalledSection = () => $scope.$emit('goto', 'installed');

        this.goToAddSection = () => {
            $scope.$emit('goto', 'add');
        };

        this.openModPage = item => {
            shell.openExternal('http://steamcommunity.com/sharedfiles/filedetails/?id='+item.publishedFileId);
        };

        this.editMod = item => {
            $scope.$emit('goto', 'add', item);
        }
    }
});

app.component('appAdd', {
    templateUrl: 'add.html',
    bindings: {
        editItem: '='
    },
    controller: function($scope, $q) {
        this.imagePath = '';
        this.packageName = this.editItem ? this.editItem.fileName.replace(/\$SLASH\$/g,'\/') : '';
        this.title = this.editItem ? this.editItem.title : '';
        this.description = this.editItem ? this.editItem.description : '';



        this.goToWorkshopSection = () => {
            $scope.$emit('goto', 'workshop');
        };
        this.openExternal = (value) => shell.openExternal(value);
        this.openImageFileDialog = () => {
            dialog.showOpenDialog({properties: ['openFile'], filters: [{name: 'Images', extensions: ['jpg','png','gif']}]}, files => {
                this.imagePath = files[0];
                $scope.$apply();
            });
        };

        this.submit = () => {
            this.submitting = true;
            var filename = this.packageName.replace(/\//g,'$SLASH$');
            var promise = $q.when();
            if(!this.editItem) {
                promise = $q((resolve, reject) => {
                    runNpmCommand('info', [this.packageName], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        var info = result[_.findKey(result)];
                        if (!info.screeps_bot && !info.screeps_mod) {
                            reject('This package is not a Screeps mod or bot');
                            return;
                        }
                        resolve(info);
                    })
                })
                    .then(info => {
                        return $q((resolve, reject) => {
                            greenworks.ugcGetItems(greenworks.UGCMatchingType.Items,
                                greenworks.UGCQueryType.RankedByVote,
                                resolve, reject);
                        })
                            .then(items => {
                                if (_.any(items, {fileName: filename})) {
                                    return $q.reject('This package is already registered on the Steam Workshop');
                                }
                            });

                    })
            }
            promise.then(() => {
                    if(!this.imagePath) {
                        return;
                    }
                    return $q((resolve, reject) => greenworks.saveFilesToCloud([this.imagePath], resolve, reject))
                        .then(() => $q((resolve, reject) => greenworks.fileShare(this.imagePath, resolve, reject)));
                })
                .then(() => {
                    if(this.editItem) {
                        return $q((resolve, reject) => greenworks.updatePublishedWorkshopFile(this.editItem.publishedFileId,
                            filename, this.imagePath, this.title, this.description, resolve, reject));
                    }
                    else {
                        return $q((resolve, reject) => greenworks.saveTextToFile(filename, this.packageName, resolve, reject))
                            .then(() => $q((resolve, reject) => greenworks.fileShare(filename, resolve, reject)))
                            .then(() => $q((resolve, reject) => greenworks.publishWorkshopFile(filename,
                            this.imagePath, `[${this.packageName}] ${this.title}`, this.description, resolve, reject)))
                    }
                })
                .then(() => this.goToWorkshopSection())
                .catch(err => alert(err))
                .finally(() => this.submitting = false);
        };
    }
});