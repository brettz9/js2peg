/*globals exports, unescape, escape */

// In use by Content-Disposition and Link

(function () {
'use strict';

function decodeRFC5987ValueChars (str) {
    return unescape(str);
}
function encodeRFC5987ValueChars (str) {
    return encodeURIComponent(str).
        // Note that although RFC3986 reserves "!", RFC5987 does not, so we do not need to escape it
        replace(/['()]/g, escape). // i.e., %27 %28 %29
        replace(/\*/g, '%2A').
            // The following are not required for percent-encoding per RFC5987, so we'll allow for a little better readability over the wire: |`^
            replace(/%(?:7C|60|5E)/g, unescape);
}

exports.decodeValueChars = decodeRFC5987ValueChars;
exports.encodeValueChars = encodeRFC5987ValueChars;

}());
