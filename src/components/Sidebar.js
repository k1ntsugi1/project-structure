export default class Sidebar {
  
  element = null;
  subElements = {};
  activeNavItem = null
  

  get elementDOM() {
    const wrapper = document.createElement('div');
    const bodyOfWrapper = `
        <aside class="sidebar">
					<h2 class="sidebar__title">
						<a href="/">shop admin</a>
					</h2>
					<ul class="sidebar__nav" data-element="sidebarNav">
						<li class="active" data-page="/">
							<a href="/" >
								<i class="icon-dashboard"></i> <span>Панель управления</span>
							</a>
						</li>
						<li data-page="/products">
							<a href="/products" >
								<i class="icon-products"></i> <span>Продукты</span>
							</a>
						</li>
						<li data-page="/categories">
							<a href="/categories" >
								<i class="icon-categories"></i> <span>Категории</span>
							</a>
						</li>
						<li data-page="/sales">
							<a href="/sales" >
								<i class="icon-sales"></i> <span>Продажи</span>
							</a>
						</li>
					</ul>
					<ul class="sidebar__nav sidebar__nav_bottom">
						<li>
							<button type="button" class="sidebar__toggler" data-element="sidebarToggler">
								<i class="icon-toggle-sidebar"></i> <span>Скрыть Панель</span>
							</button>
						</li>
					</ul>
				</aside>`;

    wrapper.innerHTML = bodyOfWrapper;
    return wrapper.firstElementChild;
  }

  setSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      const name = element.dataset.element;
      this.subElements[name] = element;
    }
  }

  toggleSidebarHandler = () => {
    document.body.classList.toggle('is-collapsed-sidebar');
  }

  setActiveNavItemHandler = () => {
    
    const path = document.location.pathname;
    
    const { sidebarNav } = this.subElements;
    const [formatedPath] = path.match(/^\/[^/]*/i);

    const newActiveNavItem = sidebarNav.querySelector(`[data-page="${formatedPath}"]`);
    if (!newActiveNavItem) return;

    this.activeNavItem?.classList.remove('active');
    newActiveNavItem?.classList.add('active');
    
    this.activeNavItem = newActiveNavItem;
  }

  setEventListeners() {
    const { sidebarToggler } = this.subElements;
    sidebarToggler.addEventListener('click', this.toggleSidebarHandler);
  }

  render() {

    this.element = this.elementDOM;
    this.activeNavItem = this.element.querySelector('.active');

    this.setSubElements();
    this.setEventListeners();

  }

  remove() {
    this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
  }
}