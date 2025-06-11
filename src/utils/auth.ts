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
export function parseJwt (token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

export const getAuthToken = () => localStorage.getItem('access_token');