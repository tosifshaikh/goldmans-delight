const TOKEN_KEY = "gd_token"
const COOKIE_NAME = "gd_token"

export function getToken():string | null {
    if(typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token:string) {
    localStorage.setItem(TOKEN_KEY,token)
    document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${60*6024*7}; SameSite=Lax`
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

export function isLoggedIn():boolean {
    return !!getToken()
}