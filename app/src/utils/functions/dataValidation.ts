
function validateUsername(username: string) {
    const validator = /'^[A-Za-z][A-Za-z0-9_]*$'/

    if (!validator.test(username)) {
        return false
    }

    return true
}

function validateUsernamesFirstLetter(username: string) {
    if (!username.length) return false
    const validator = /^[A-Za-z]$/
    return validator.test(username[0])
}

export {
    validateUsername,
    validateUsernamesFirstLetter,
}
