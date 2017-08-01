export default class Avatar {

    static toLink(name) {
        return `${config.backUrl}/file/content?name=${name}&path=/avatars`;
    }

    static toLinkOrDefault(name) {
        return `${config.backUrl}/file/content?name=${name}&path=/avatars`;
    }

}
