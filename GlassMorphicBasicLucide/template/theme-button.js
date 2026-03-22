class ThemeButton extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <button id="themeToggle" class="p-3 rounded-full glass hover:scale-110 transition-transform active:scale-95">
        <i id="themeIcon" data-lucide="moon" class="w-5 h-5 text-slate-600 dark:text-yellow-400"></i>
      </button>
    `;

        const html = document.documentElement;
        // Re-initialize Lucide icons if you're using them
        if (window.lucide) {
            lucide.createIcons();
        }

        // Add your click logic right here
        this.querySelector('button').addEventListener('click', () => {
            const isDark = html.classList.toggle('dark');
            localStorage.theme = isDark ? 'dark' : 'light';
            lucide.createIcons();
            updateIcon(isDark);
        });

        // Initialize theme from local storage or system preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            html.classList.add('dark');
            updateIcon(true);
        } else {
            html.classList.remove('dark');
            updateIcon(false);
        }

        function updateIcon(isDark) {
            document.getElementById('themeIcon').setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        }
    }
}

// Define the custom tag name
customElements.define('theme-button', ThemeButton);