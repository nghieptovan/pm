let getCurrentUser,getCurrentUserFacebook,getClientId,getClientShortName, getClientName;

if (localStorage.getItem('rememberMe') == 'true') {
    getCurrentUser = () => JSON.parse(localStorage.getItem('currentUser')) || {};
    getCurrentUserFacebook = () => JSON.parse(localStorage.getItem('currentUserFacebook')) || {};
    getClientId = () => JSON.parse(localStorage.getItem('clientId')) || {};    
    getClientShortName = async () => {
        const currentUser = await getCurrentUser();
        return currentUser.brandName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || '';
    }
} else {
    getClientName = () => JSON.parse(JSON.stringify(sessionStorage.getItem('clientName'))) || {};
    getCurrentUser = () => JSON.parse(sessionStorage.getItem('currentUser')) || {};
    getCurrentUserFacebook = () => JSON.parse(sessionStorage.getItem('currentUserFacebook')) || {};
    getClientId = () => JSON.parse(sessionStorage.getItem('clientId')) || {};
    getClientShortName = async () => {
        const currentUser = await getCurrentUser();
        return currentUser.brandName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || '';
    }
}


export {
    getCurrentUser,
    getClientShortName,
    getCurrentUserFacebook,
    getClientId,
    getClientName
}