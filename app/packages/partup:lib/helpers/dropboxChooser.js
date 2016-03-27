Partup.helpers.pdfExtensions = ['.pdf'];
Partup.helpers.docExtensions = ['.doc', '.docx', '.rtf'];
Partup.helpers.presentationExtensions = ['.pps', '.ppsx', '.ppt'];
Partup.helpers.fallbackFileExtensions = ['.csv', '.xls', '.xlsx', '.ai', '.bmp', '.eps', '.psd', '.tiff', '.tif', '.svg'];
Partup.helpers.imageExtensions = ['.gif', '.jpg', '.jpeg', '.png'];

DropboxChooser = function (options) {
        this.options = _.extend({
            allowedExtensions: {
                images: Partup.helpers.imageExtensions,
                docs: _.flatten([
                    Partup.helpers.pdfExtensions,
                    Partup.helpers.docExtensions,
                    Partup.helpers.presentationExtensions,
                    Partup.helpers.fallbackFileExtensions
                ])
            }
        }, options);
    } || {};

DropboxChooser.prototype.getAllExtensions = function () {
    var self = this;
    return _.chain(self.options.allowedExtensions).keys().map(function (type) {
        return self.options.allowedExtensions[type];
    }).flatten().value();
};

DropboxChooser.prototype.getExtensionFromFileName = function (filename) {
    return filename.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/)[0];
};

DropboxChooser.prototype.fileNameIsImage = function (fileName) {
    return _.include(this.options.allowedExtensions.images,
        this.getExtensionFromFileName(fileName)
    );
};

DropboxChooser.prototype.fileNameIsDoc = function (fileName) {
    return _.include(this.options.allowedExtensions.docs,
        this.getExtensionFromFileName(fileName)
    );
};


DropboxChooser.prototype.partupUploadPhoto = function (template, dropboxFile) {
    template.uploadingPhotos.set(true);
    return new Promise(function (resolve, reject) {
        Partup.client.uploader.uploadImageByUrl(dropboxFile.link, function (error, image) {
            if (error) {
                Partup.client.notify.error(TAPi18n.__(error.reason));
                return reject(error);
            }
            dropboxFile._id = image._id;
            resolve(dropboxFile);
        });
    });
};

DropboxChooser.prototype.partupUploadDoc = function (template, dropboxFile) {
    template.uploadingDocuments.set(true);
    return new Promise(function (resolve, reject) {
        dropboxFile._id = new Meteor.Collection.ObjectID()._str;

        if (!dropboxFile._id) {
            return reject(new Error('meteor _id does not created!'));
        }
        resolve(dropboxFile);
    });
};

Partup.helpers.DropboxChooser = DropboxChooser;

var DropboxRenderer = function () {
    var dropboxChooser = new DropboxChooser();

    return {
        getFileIdFromDirectLink: getFileIdFromDirectLink,
        createPreviewLinkFromDirectLink: createPreviewLinkFromDirectLink,
        getSvgIcon: getSvgIcon
    };

    function getFileIdFromDirectLink(fileUrl) {
        return fileUrl.match(/view\/(\w+)/)[1];
    }

    function createPreviewLinkFromDirectLink(directLinkUrl, fileName) {
        var fileId = getFileIdFromDirectLink(directLinkUrl);
        return 'https://www.dropbox.com/s/' + fileId + '/' + fileName + '?dl=0';
    }

    /**
     * @param fileName - file name of the dropbox object
     * @returns {string}
     */
    function getSvgIcon(fileName) {
        var extension = dropboxChooser.getExtensionFromFileName(fileName);
        var svgFileName = 'icon_file.svg';

        if (_.include(Partup.helpers.fallbackFileExtensions, extension)) {
            svgFileName = 'icon_file.svg';
        }
        else if (_.include(Partup.helpers.presentationExtensions, extension)) {
            svgFileName = 'icon_ppt.svg';
        }
        else if (_.include(Partup.helpers.docExtensions, extension)) {
            svgFileName = 'icon_doc.svg';
        }
        else if (_.include(Partup.helpers.pdfExtensions, extension)) {
            svgFileName = 'icon_pdf.svg';
        }

        return svgFileName;
    }
};

Partup.helpers.DropboxRenderer = DropboxRenderer;