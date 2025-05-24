export const storeTokenFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        localStorage.setItem('access_token', token);
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('token');

    if (url.hash === '#_=_') {
        url.hash = '';
    }

    window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
};

export function logout() {
    localStorage.removeItem('access_token');
}

export const getAuthToken = () => localStorage.getItem('access_token');