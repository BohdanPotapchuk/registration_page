
function initMap() {
  let map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 43.44474962862139, lng: -80.5156345011908 },
    zoom: 15,
    styles: [
      {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "transit",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      }
    ]

  });
  let marker = new google.maps.Marker({
    position: { lat: 43.44474962862139, lng: -80.5156345011908 },
    map: map,
    icon: 'icon_map.png'
  });
  let info = new google.maps.InfoWindow({
    content: `<div style="padding-right:10px"><h3 style="margin:5px">Voodoo</h3><p style="margin:5px"> 137 Glasgow St., Unit </br>
         115 Kitchener, ON N2G 4X8 </br> Ukraine</p>
         <p style="color:rgb(126, 125, 125);margin:5px"><a href="tel:+1-800-480-9597" id="num">1-800-480-9597</a></br>
         <a href="malito:info@voodoo.com" id="em">info@voodoo.com</a>
         </p></div>`
  });
  marker.addListener("click", function () {
    info.open(map, marker)
  });
}


class CustomSelect {
  static EL = 'select';
  static EL_SHOW = 'select_show';
  static EL_OPTION = 'select__option';
  static EL_OPTION_SELECTED = 'select__option_selected';
  static DATA = '[data-select]';
  static DATA_TOGGLE = '[data-select="toggle"]';

  static template(params) {
    const { name, options, targetValue } = params;
    const items = [];
    let selectedIndex = -1;
    let selectedValue = '';
    let selectedContent = '';
    options.forEach((option, index) => {
      let selectedClass = '';
      if (option[0] === targetValue) {
        selectedClass = ` ${this.EL_OPTION_SELECTED}`;
        selectedIndex = index;
        selectedValue = option[0];
        selectedContent = option[1];
      }
      items.push(`<li class="select__option${selectedClass}" data-select="option"
          data-value="${option[0]}" data-index="${index}">${option[1]}</li>`);
    });
    return `<button type="button" class="select__toggle" name="${name}"
        value="${selectedValue}" data-select="toggle" data-index="${selectedIndex}">
        ${selectedContent}</button><div class="select__dropdown">
        <ul class="select__options">${items.join('')}</ul></div>`;
  }

  static hideOpenSelect() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest(`.${this.EL}`)) {
        const elsActive = document.querySelectorAll(`.${this.EL_SHOW}`);
        elsActive.forEach((el) => {
          el.classList.remove(this.EL_SHOW);
        });
      }
    });
  }
  static create(target, params) {
    this._el = typeof target === 'string' ? document.querySelector(target) : target;
    if (this._el) {
      return new this(target, params);
    }
    return null;
  }
  constructor(target, params) {
    this._el = typeof target === 'string' ? document.querySelector(target) : target;
    this._params = params || {};
    this._onClickFn = this._onClick.bind(this);
    if (this._params.options) {
      this._el.innerHTML = this.constructor.template(this._params);
      this._el.classList.add(this.constructor.EL);
    }
    this._elToggle = this._el.querySelector(this.constructor.DATA_TOGGLE);
    this._el.addEventListener('click', this._onClickFn);
  }

  _onClick(e) {
    const { target } = e;
    const type = target.closest(this.constructor.DATA).dataset.select;
    if (type === 'toggle') {
      this.toggle();
    } else if (type === 'option') {
      this._changeValue(target);
    }
  }

  _updateOption(el) {
    const elOption = el.closest(`.${this.constructor.EL_OPTION}`);
    const elOptionSel = this._el.querySelector(`.${this.constructor.EL_OPTION_SELECTED}`);
    if (elOptionSel) {
      elOptionSel.classList.remove(this.constructor.EL_OPTION_SELECTED);
    }
    elOption.classList.add(this.constructor.EL_OPTION_SELECTED);
    this._elToggle.textContent = elOption.textContent;
    this._elToggle.value = elOption.dataset.value;
    this._elToggle.dataset.index = elOption.dataset.index;
    this._el.dispatchEvent(new CustomEvent('select.change'));
    this._params.onSelected ? this._params.onSelected(this, elOption) : null;
    return elOption.dataset.value;
  }

  _reset() {
    const selected = this._el.querySelector(`.${this.constructor.EL_OPTION_SELECTED}`);
    if (selected) {
      selected.classList.remove(this.constructor.EL_OPTION_SELECTED);
    }
    this._elToggle.textContent = '???????????????? ???? ????????????';
    this._elToggle.value = '';
    this._elToggle.dataset.index = '-1';
    this._el.dispatchEvent(new CustomEvent('select.change'));
    this._params.onSelected ? this._params.onSelected(this, null) : null;
    return '';
  }

  _changeValue(el) {
    if (el.classList.contains(this.constructor.EL_OPTION_SELECTED)) {
      return;
    }
    this._updateOption(el);
    this.hide();
  }

  show() {
    document.querySelectorAll(this.constructor.EL_SHOW)
      .forEach((el) => {
        el.classList.remove(this.constructor.EL_SHOW);
      });
    this._el.classList.add(`${this.constructor.EL_SHOW}`);
  }

  hide() {
    this._el.classList.remove(this.constructor.EL_SHOW);
  }

  toggle() {
    this._el.classList.contains(this.constructor.EL_SHOW) ? this.hide() : this.show();
  }

  dispose() {
    this._el.removeEventListener('click', this._onClickFn);
  }

  get value() {
    return this._elToggle.value;
  }

  set value(value) {
    let isExists = false;
    this._el.querySelectorAll('.select__option')
      .forEach((option) => {
        if (option.dataset.value === value) {
          isExists = true;
          this._updateOption(option);
        }
      });
    if (!isExists) {
      this._reset();
    }
  }

  get selectedIndex() {
    return this._elToggle.dataset.index;
  }

  set selectedIndex(index) {
    const option = this._el.querySelector(`.select__option[data-index="${index}"]`);
    if (option) {
      this._updateOption(option);
    }
    this._reset();
  }
}

CustomSelect.hideOpenSelect();

const select1 = new CustomSelect('#select-1');
const select2 = new CustomSelect('#select-2');
const select3 = new CustomSelect('#select-3');
