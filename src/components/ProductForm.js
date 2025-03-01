import escapeHtml from "../utils/escape-html.js";

import SortableList from '../components/SortableList.js';
import NotificationMessage from "./Notification.js";

import fetchJson from "../utils/fetchJson.js";

import grabIcon from '../styles/svg/icon-grab.svg';
import trashIcon from '../styles/svg//icon-trash.svg';

export default class ProductForm {

  element = null
  subElements = {}
  data = {}
  images = []

  constructor(
    productId,
    {
      categoriesURL,
      productURL,
      imageURL,
    }
  ) {

    this.productId = productId;

    this.urls = {
      categories: new URL(categoriesURL),
      products: new URL(productURL),
      images: new URL(imageURL),
    };
  }

  setSearchParamsOfURLs() {
    const { categories, products } = this.urls;

    categories.searchParams.set('_sort', 'weigh');
    categories.searchParams.set('_refs', 'subcategory');

    products.searchParams.set('id', this.productId);
  }

  deleteSearchParamsOfURLs() {
    const { categories, products } = this.urls;

    categories.searchParams.delete('_sort');
    categories.searchParams.delete('_refs');

    products.searchParams.delete('id');
  }

  getTitle() {
    return (
      `<fieldset>
        <label class="form-label">Название товара</label>
        <input required="" 
               autofocus
               type="text"
               name="title"
               class="form-control"
               placeholder="Название товара"
               value=""
               >
      </fieldset>`
    );
  }

  getDescription() {
    return (
      `<label class="form-label">Описание</label>
       <textarea required="" 
                 class="form-control" 
                 name="description" 
                 data-element="productDescription" 
                 placeholder="Описание товара"
                 value=""
                 ></textarea>`
    );
  }

  getImage(image) {

    const { source, url } = image;
    const escapedSource = escapeHtml(source);
    const escapedUrl = escapeHtml(url);

    const wrapper = document.createElement('div');
    wrapper.innerHTML =
      `<li class="products-edit__imagelist-item">
        <input type="hidden" name="url" value="${escapedUrl}">
        <input type="hidden" name="source" value="${escapedSource}">
        <span>
          <img src=${grabIcon} data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${escapedUrl}">
          <span>${escapedSource}</span>
        </span>
        <button type="button">
          <img src=${trashIcon} data-delete-handle="" alt="delete">
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  getImages() {
    return (
      ` <label class="form-label">Фото</label>
        <div data-element="imageListContainer"></div>
        <button type="button" name="uploadImage" class="button-primary-outline">
          <span>Загрузить</span>
        </button>`
    );
  }

  getCategory(category) {

    const { title: titleOfCategory, subcategories } = category;
    const { subcategory: activeSubcategory } = this.productId ? this.data.products[0] : { subcategory: null };

    const options = subcategories.map((subcategory) => {

      const { id, title: titleOfSubcategory } = subcategory;

      const escapedTitleOfCategory = escapeHtml(`${titleOfCategory}`)
      const escapedTitleOfSubcategory = escapeHtml(`${titleOfSubcategory}`)

      const text = `${escapedTitleOfCategory} > ${escapedTitleOfSubcategory}`;
      const activeStatus = activeSubcategory === id;

      return new Option(text, `${escapeHtml(id)}`, false, activeStatus)

    });

    return options;
  }

  getCategories() {
    return (
      `<label class="form-label">Категория</label>
      <select class="form-control" name="subcategory" data-element="subcategories"></select>`
    );
  }

  getPrice() {
    return (
      `<fieldset>
        <label class="form-label">Цена ($)</label>
        <input required="" 
               type="number"
               name="price"
               class="form-control"
               placeholder="100"
               value="">
      </fieldset>`
    );
  }

  getDiscount() {
    return (
      `<fieldset>
        <label class="form-label">Скидка ($)</label>
        <input required="" 
               type="number" 
               name="discount" 
               class="form-control" 
               placeholder="0"
               value="">
      </fieldset>`
    );
  }

  getQuantity() {
    return (
      `<label class="form-label">Количество</label>
       <input required="" 
              type="number"
              class="form-control"
              name="quantity"
              placeholder="1"
              value="">`
    );
  }

  getStatus() {
    return (
      `<label class="form-label">Статус</label>
        <select class="form-control" name="status" value=''>
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>`
    );
  }

  get elementDOM() {
    const wrapper = document.createElement('div');
    const form = (
      `<div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            ${this.getTitle()}
          </div>
          <div class="form-group form-group__wide">
            ${this.getDescription()}
          </div>
          <div class="form-group form-group__wide" data-element="sortableListContainer">
            ${this.getImages()}
          </div>
          <div class="form-group form-group__half_left">
            ${this.getCategories()}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            ${this.getPrice()}
            ${this.getDiscount()}
          </div>
          <div class="form-group form-group__part-half">
            ${this.getQuantity()}
          </div>
          <div class="form-group form-group__part-half">
            ${this.getStatus()}
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>`
    );
    wrapper.innerHTML = form;
    return wrapper.firstElementChild;
  }

  async fetchGetData(url) {

    this.setSearchParamsOfURLs()

    const response = await fetchJson(url);

    this.deleteSearchParamsOfURLs();

    return response;

  }

  showSuccessNotification() {
    const notification = new NotificationMessage({
      message: 'Товар сохранен',
      wrapperOfElement: document.body,
      duration: 3000,
      type: 'success'
    });

    notification.show();
  }

  async fetchPostData(method, body) {

    const { products } = this.urls;
    const { productForm } = this.subElements;

    await fetchJson(products, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    this.showSuccessNotification();

    if (method === 'PUT') {
      const linkToEditProductForm = document.createElement('a');
      linkToEditProductForm.setAttribute('href', `/products/${body['id']}`);

      productForm.append(linkToEditProductForm);

      linkToEditProductForm.click();
    }

  }

  getFormatedFormData() {

    const keysWithNumberValue = ['discount', 'price', 'quantity', 'status'];

    const formatedFormData = {
      images: this.images,
    };

    const { productForm } = this.subElements;

    const formData = new FormData(productForm);
    formData.delete('url');
    formData.delete('source');

    const id = this.productId ? this.productId : formData.get('title');
    formData.set('id', id);

    for (const [key, value] of formData.entries()) {
      formatedFormData[key] = keysWithNumberValue.includes(key) ? Number(value) : value;
    }

    return formatedFormData;
  }

  toggleStatusOfLoadingImage() {
    const { productForm } = this.subElements;
    productForm.uploadImage.classList.toggle("is-loading");
    productForm.uploadImage.disabled = !productForm.uploadImage.disabled;
  }

  async fetchPostImage(formData) {

    const { images } = this.urls;
    this.toggleStatusOfLoadingImage();

    const response = await fetchJson(images.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      },
      body: formData,
      referrer: ''
    });

    this.toggleStatusOfLoadingImage();
    return response.data.link;

  }

  getInputIMGLoader() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<input name="image" type="file" accept="image/*" style="opacity:0"/>`;
    return wrapper.firstElementChild;
  }

  loadImgHander = () => {
    const { productForm, sortableList } = this.subElements;

    const inputIMGLoader = this.getInputIMGLoader();

    inputIMGLoader.onchange = async () => {
      const formData = new FormData();
      const file = inputIMGLoader.files[0];
      formData.append(inputIMGLoader.name, file);

      const link = await this.fetchPostImage(formData);

      if (!link) {
        inputIMGLoader.remove();
        return;
      }

      const image = { source: file.name, url: link };

      this.images.push(image);
      sortableList.append(...SortableList.addClassesOfItems([this.getImage(image)]));

      inputIMGLoader.remove();
    };

    productForm.append(inputIMGLoader);
    inputIMGLoader.click();
  }

  submitHandler = (event) => {
    event.preventDefault();
    const formData = this.getFormatedFormData();

    const method = this.productId
      ? 'PATCH'
      : 'PUT';

    this.fetchPostData(method, formData);
  }

  removeListItemHandler = (event) => {
    event.preventDefault();
    const target = event.target;

    if (!target.closest('[data-delete-handle]')) { return; }

    const listItem = target.closest('[data-element="sortableItem"]');
    const inputs = listItem.querySelectorAll('input');
    const imageForRemoving = {};

    for (const input of inputs) {
      imageForRemoving[input.name] = input.value;
    }

    const { url: remUrl, source: remSource } = imageForRemoving;

    this.images = this.images.filter(({ url, source }) => (url !== remUrl) && (source !== remSource));
  }

  fillFormFields() {

    const { subcategories, productForm } = this.subElements;
    const elementsOfSubcategories = this.data.categories.flatMap(category => this.getCategory(category));

    subcategories.append(...elementsOfSubcategories);

    if (this.productId) {

      const fieldNamesForFilling = ['title', 'description', 'price', 'discount', 'quantity', 'status'];

      Array.from(productForm.elements).forEach((element) => {

        const name = element.name;

        if (fieldNamesForFilling.includes(name)) {
          const value = this.data.products[0][name];
          productForm[name].value = value;
        }

      });

    }
  }

  createSortableImages() {
    const { imageListContainer } = this.subElements;
    const sortableList = new SortableList({ items: this.images.map(this.getImage) });
    imageListContainer.append(sortableList.element);
  }

  async update() {
    const nameOfDataForFetchGet = this.productId ? ['categories', 'products'] : ['categories'];

    const responses = nameOfDataForFetchGet.map(positionName => this.fetchGetData(this.urls[positionName]));
    const dataOfResponses = await Promise.all(responses)

    dataOfResponses.forEach((data, index) => {

      const nameOfData = nameOfDataForFetchGet[index];
      this.data[nameOfData] = data;
      if (nameOfData === 'products') { this.images = data[0]?.images ?? []; }
    });

    this.createSortableImages();

    if (!this.subElements.sortableList) this.setSubElements();
    this.fillFormFields();
  }

  setSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach((element) => {
      const name = element.dataset.element;
      this.subElements[name] = element;
    });
  }

  addEventListeners() {

    const { productForm, imageListContainer } = this.subElements;
    productForm.addEventListener('submit', this.submitHandler);
    productForm.uploadImage.addEventListener('click', this.loadImgHander);
    imageListContainer.addEventListener('pointerdown', this.removeListItemHandler);
  }

  render() {
    this.element = this.elementDOM;
    this.setSubElements();
    this.addEventListeners();
  }

  remove() {
    this.element?.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
  }
}