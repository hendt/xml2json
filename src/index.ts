const defaultOptions = {
    aloneValueName: '_@attribute'
};

/**
 * Main function. Clears the given xml and then starts the recursion
 * @param xmlStr
 * @param options the options
 */
export function xml2json(xmlStr: string, options = defaultOptions) {
    options = {...defaultOptions, ...options};
    xmlStr = cleanXML(xmlStr, options.aloneValueName);
    return xml2jsonRecurse(xmlStr);
}

/**
 * Recursive function that creates a JSON object with a given XML string.
 *
 * @param xmlStr
 */
function xml2jsonRecurse(xmlStr: string) {
    const obj: any = {};
    let startTagMatch;
    while ((startTagMatch = xmlStr.match(/<[^\/][^>]*>/))) {
        let openingTag = startTagMatch[0];
        let tagName = openingTag.substring(1, openingTag.length - 1);
        let indexClosingTag = xmlStr.indexOf(openingTag.replace('<', '</'));

        // account for case where additional information in the opening tag
        let closingTagMatch;
        if (indexClosingTag == -1 && (closingTagMatch = openingTag.match(/[^<][\w+$]*/))) {
            tagName = closingTagMatch[0];
            indexClosingTag = xmlStr.indexOf('</' + tagName);
            if (indexClosingTag == -1) {
                indexClosingTag = xmlStr.indexOf('<\\/' + tagName);
            }
        }
        let inner_substring = xmlStr.substring(openingTag.length, indexClosingTag);
        const tempVal = inner_substring.match(/<[^\/][^>]*>/) ? xml2json(inner_substring) : inner_substring;

        // account for array or obj
        if (obj[tagName] === undefined) {
            obj[tagName] = tempVal;
        } else if (Array.isArray(obj[tagName])) {
            obj[tagName].push(tempVal);
        } else {
            obj[tagName] = [obj[tagName], tempVal];
        }

        xmlStr = xmlStr.substring(openingTag.length * 2 + 1 + inner_substring.length);
    }

    return obj;
}

/**
 * Removes some characters that would break the recursive function.
 *
 * @param xmlStr
 * @param aloneValueName
 * @returns {string}
 */
function cleanXML(xmlStr: string, aloneValueName: string) {
    xmlStr = xmlStr.replace(/<!--[\s\S]*?-->/g, ''); //remove commented lines
    xmlStr = xmlStr.replace(/[\n\t\r]/g, ''); //replace special characters
    xmlStr = xmlStr.replace(/ +<|\t+</g, '<'); //replace leading spaces and tabs
    xmlStr = xmlStr.replace(/> +|>\t+/g, '>'); //replace trailing spaces and tabs
    xmlStr = xmlStr.replace(/<\?[^>]*\?>/g, ''); //delete docType tags

    xmlStr = replaceSelfClosingTags(xmlStr); //replace self closing tags
    xmlStr = replaceAloneValues(xmlStr, aloneValueName); //replace the alone tags values
    xmlStr = replaceAttributes(xmlStr); //replace attributes

    return xmlStr;
}

/**
 * Replaces all the self closing tags with attributes with another tag containing its attribute as a property.
 * The function works if the tag contains multiple attributes.
 * Example : '<tagName attrName="attrValue" />' becomes
 *           '<tagName><attrName>attrValue</attrName></tagName>'
 * @param xmlStr
 * @returns {*}
 */
function replaceSelfClosingTags(xmlStr: string) {
    const selfClosingTags = xmlStr.match(/<[^/][^>]*\/>/g);
    if (!selfClosingTags) {
        return xmlStr
    }

    for (let i = 0; i < selfClosingTags.length; i++) {
        const oldTag = selfClosingTags[i];
        const match = oldTag.match(/[^<][\w+$]*/);
        if (match) {
            const tagName = match[0];
            const closingTag = "</" + tagName + ">";
            const newTag = extracted(tagName, oldTag) + closingTag;

            xmlStr = xmlStr.replace(oldTag, newTag);
        }
    }

    return xmlStr;
}

/**
 *  Replaces all the tags with attributes and a value with a new tag.
 *
 *  Example : '<tagName attrName="attrValue">tagValue</tagName>' becomes
 *  '<tagName><attrName>attrValue</attrName><_@attribute>tagValue</_@attribute></tagName>'
 *
 * @param xmlStr
 * @param aloneValueName
 * @returns {string}
 */
function replaceAloneValues(xmlStr: string, aloneValueName: string) {
    const tagsWithAttributesAndValue = xmlStr.match(/<[^\/][^>][^<]+\s+.[^<]+[=][^<]+>([^<]+)/g);
    if (!tagsWithAttributesAndValue) {
        return xmlStr;
    }

    for (let i = 0; i < tagsWithAttributesAndValue.length; i++) {
        const oldTag = tagsWithAttributesAndValue[i];
        const oldTagName = oldTag.substring(0, oldTag.indexOf(">") + 1);
        const oldTagValue = oldTag.substring(oldTag.indexOf(">") + 1);

        const newTag = oldTagName + "<" + aloneValueName + ">" + oldTagValue + "</" + aloneValueName + ">";

        xmlStr = xmlStr.replace(oldTag, newTag);
    }

    return xmlStr;
}

function extracted(tagName: string, oldTag: string) {
    let newTag = "<" + tagName + ">";
    const attrs = oldTag.match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g);
    if (!attrs) {
        return newTag
    }

    for (let j = 0; j < attrs.length; j++) {
        const attr = attrs[j];
        const attrName = attr.substring(0, attr.indexOf('='));
        const attrValue = attr.substring(attr.indexOf('"') + 1, attr.lastIndexOf('"'));

        newTag += "<" + attrName + ">" + attrValue + "</" + attrName + ">";
    }

    return newTag;
}

/**
 * Replaces all the tags with attributes with another tag containing its attribute as a property.
 * The function works if the tag contains multiple attributes.
 *
 * Example : '<tagName attrName="attrValue"></tagName>' becomes '<tagName><attrName>attrValue</attrName></tagName>'
 *
 * @param xmlStr
 * @returns {*}
 */
function replaceAttributes(xmlStr: string) {
    const tagsWithAttributes = xmlStr.match(/<[^\/][^>][^<]+\s+.[^<]+[=][^<]+>/g);
    if (!tagsWithAttributes) {
        return xmlStr
    }

    for (let i = 0; i < tagsWithAttributes.length; i++) {
        const oldTag = tagsWithAttributes[i];
        const match = oldTag.match(/[^<]\S*/);
        if (match) {
            const tagName = match[0];
            const newTag = extracted(tagName, oldTag);
            xmlStr = xmlStr.replace(oldTag, newTag);
        }
    }

    return xmlStr;
}