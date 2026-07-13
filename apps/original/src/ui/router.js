export class Router {
    constructor() {
        this.routes = {
            'explorer': document.getElementById('view-explorer'),
            'world': document.getElementById('view-world'),
            'games': document.getElementById('view-games'),
            'lessons': document.getElementById('view-lessons')
        };
        this.navButtons = document.querySelectorAll('.nav-btn');
        
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.navigate(e.currentTarget.dataset.view);
            });
        });

        // Initialize to first view
        this.navigate('explorer');
    }

    navigate(viewId) {
        // Update nav UI
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-view="${viewId}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Update views
        Object.values(this.routes).forEach(view => {
            if (view) view.style.display = 'none';
        });

        if (this.routes[viewId]) {
            this.routes[viewId].style.display = 'block';
            this.routes[viewId].classList.add('fade-in');
        }
    }
}
