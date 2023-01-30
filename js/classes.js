// all elements created in js
class MyElement {
    content = [];

    constructor() { }

    // draw all subelements; used by containers (Slots and Gallery)
    show() {
        for (let i = 0; i < this.content.length; i++) {
            this.parent.appendChild(this.content[i].getElement());
        }

    }

    // return classes element
    getElement() {
        return this.element;
    }

    // srt img inside this.element
    setImg(src) {
        this.img = document.createElement('img');
        this.img.src = src;
        this.src = src;
        this.element.appendChild(this.img);
    }

    // set id of curent icon displayed
    setDataIcon(id) {
        let newDataIcon = id;
        this.dataIcon = newDataIcon;
        if (this.element) {
            this.element.setAttribute('data-icon', newDataIcon);
        }
    }

    // gets id of current icon displayed
    getDataIcon() {
        return this.dataIcon;
    }

    getSrc() {
        return this.src;
    }
}

// "button" to select an icon
class Slots extends MyElement {
    // create elements
    constructor(parent, galleryParent) {
        super();
        this.parent = parent;
        // show slot inside slots container
        this.gallery = new Gallery(galleryParent);

        for (let i = 0; i < 4; i++) {
            // connecting with gallery while init
            let slot = new Slot(`slot${i}`, this.gallery);
            slot.setImg('img/plus-square-fill.svg');
            this.content.push(slot);
        }
        this.show();
    }
}

class Slot extends MyElement {
    constructor(id, gallery) {
        super();
        this.gallery = gallery;
        // slot itself (container)
        this.element = document.createElement('button');
        this.element.classList.add('slot', 'slots-btn', 'btn', 'btn-success');
        this.element.id = id;
        this.element.setAttribute('data-icon', '');
        this.setEventListener();
    }

    setEventListener() {
        this.element.addEventListener('click', () => {
            this.gallery.setDisplay(true);
            // change all slots
            const allSlots = document.querySelectorAll('.slot');
            for (let i = 0; i < allSlots.length; i++) {
                allSlots[i].id = '';
                allSlots[i].classList.remove('btn-danger');
            }
            // highlight this slot (which was clicked)
            this.element.classList.add('btn-danger');
            this.element.id = 'active-slot';
            document.querySelector('#prompt').style.display = 'inline';

            // reset search-box
            document.querySelector('#search-box').value = '';
            this.gallery.doSearch('');
        });
    }
}

// all icons showing after click on slot
class Gallery extends MyElement {

    iconsURL = [];
    translate = {};

    constructor(parent) {
        super();
        this.parent = parent;
        this.parent.style.display = 'none';
        // create all icons
        this.APICall('http://82.142.87.102/extAPI/api/icon/read.php?parent=2');
    }

    init() {
        this.fillIconsURL();
        this.createIcons();
        this.show();

        // fulltext search
        this.searchBox = document.querySelector('#search-box');
        this.setSearchEventListener();
    }

    setSearchEventListener() {
        this.searchBox.addEventListener('input', () => {
            this.doSearch(this.searchBox.value);
        });
    }

    doSearch(text) {
        // console.log(this.content);
        // console.log(this.translate);
        for (const [key, value] of Object.entries(this.iconsURL)) {
            const currentIcon = document.querySelector('#icon' + key);
            if (value['name'].toLowerCase().includes(text.toLowerCase())) {
                // if matches search: show / keep shown
                currentIcon.style.display = 'inline-block';
            } else {
                currentIcon.style.display = 'none';
            }
        }
    }

    // hides / shows gallery
    setDisplay(isDisplayed) {
        this.parent.style.display = isDisplayed ? 'block' : 'none';
    }

    // creates all icons
    createIcons() {
        // set first icon (to empty selected slot when clicked)
        let firstIcon = new GalleryIcon(0);
        firstIcon.setImg('img/plus-square-fill.svg');
        firstIcon.setDataIcon('');
        this.content.push(firstIcon);

        // for each URL create icon
        for (const [key, value] of Object.entries(this.iconsURL)) {
            let icon = new GalleryIcon(key);
            icon.setImg(value['filename']);
            icon.setDataIcon(key);
            icon.setName(value['name']);
            this.content.push(icon);
        }
    }

    //////// DATA PROCESSING METHODS BELOW /////
    async APICall(url) {
        // gets data from 'url'
        await fetch(url)
            .then((response) => response.json())
            .then((json) => { this.json = json; this.init() })
            .catch(error => { console.log(error) });
    }

    // creates array containing URLs of all icons
    fillIconsURL() {
        for (let i = 0; i < this.json.length; i++) {
            // this.iconsURL.push(this.getIconUrl(this.json[i].filename));
            this.iconsURL[this.json[i].id] = {
                'filename': this.getIconUrl(this.json[i].filename),
                'name': this.json[i].name,
            };
            // convert order  number to id
            this.translate[this.json[i].id] = i + 1;
        }
    }

    // gets icon's url from filename
    getIconUrl(filename) {
        // replace spaces with %20
        let urlPart = filename.replace(/ /g, '%20');
        let url = 'https://eletak.oresi.cz/files/Icons/CZ/';
        return url + urlPart;
    }
}

// icon showing inside gallery
class GalleryIcon extends MyElement {
    slots = document.querySelectorAll('.slot');
    galleryContainer = document.querySelector('#gallery');
    prompt = document.querySelector('#prompt');

    constructor(id) {
        super();
        this.setDataIcon(id);
        // create new container for icon
        this.element = document.createElement('div');
        this.element.classList.add('gallery-btn', 'btn');
        this.element.id = `icon${id}`;
        this.setEventListener();
    }

    setName(decription) {
        this.element.appendChild(document.createTextNode(decription));
    }

    setEventListener() {
        this.element.addEventListener('click', () => {
            for (let i = 0; i < this.slots.length; i++) {
                // hide gallery and prompt
                this.galleryContainer.style.display = 'none';
                this.prompt.style.display = 'none';
            }
            // slot that was clicked
            const activeSlot = document.querySelector('#active-slot');
            activeSlot.classList.remove('btn-danger');
            const dataIcon = this.getDataIcon();
            activeSlot.firstChild.src = this.getSrc();
            activeSlot.setAttribute('data-icon', dataIcon);
        });
    }
}