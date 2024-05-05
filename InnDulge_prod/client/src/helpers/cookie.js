import cookie from 'react-cookies'

export const loginUser = () => {
    return {userId: cookie.load('userId'), username: cookie.load('username'), business_login: cookie.load('business_login')}
}

export const onLogin = (user) => {
    console.log(user);
    let oneDay = new Date(new Date().getTime() + 24 * 3600 * 1000); // one day
    cookie.save('userId', user.userId, { expires: oneDay});
    cookie.save('username', user.username, { expires: oneDay});
    cookie.save('business_login', user.business_login, { expires: oneDay});
    console.log(cookie.loadAll());
}

export const onLogout = () => {
    cookie.remove('userId');
    cookie.remove('username');
    cookie.remove('business_login');
};