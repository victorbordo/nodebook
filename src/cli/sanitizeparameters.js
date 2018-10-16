const parseArgs = require('minimist');
const { resolve: resolvePath } = require('path');
const fs = require('fs');

module.exports = async function sanitizeParameters(rawargv) {
    const argv = parseArgs(rawargv, {
        boolean: 'docker',
        string: ['notebooks'],
    });

    // --docker

    const docker = argv.docker;

    // --notebooks
    let notebooks;
    if (!("notebooks" in argv) || typeof argv.notebooks !== "string" || argv.notebooks.trim() === '') {
        if (argv['_'].length > 0) {
            notebooks = argv['_'].shift().trim();
        } else {
            throw new Error("--notebooks path/to/notebooks is required if path not provided as argument.");
        }
    } else {
        notebooks = argv.notebooks;
    }

    notebooks = resolvePath(notebooks);

    if (!fs.existsSync(notebooks)) {
        throw new Error("Notebooks path does not exist.");
    }

    if (!fs.statSync(notebooks).isDirectory()) {
        throw new Error("Notebooks path is not a directory.");
    }

    // Check for unknown parameters

    if (argv['_'].length > 0) {
        // ex: node . "abcdef"
        throw new Error("Unknown argument(s): " + argv['_'].join(', '));
    }

    const known = ['notebooks', 'docker'];
    const unknown = Object.keys(argv).filter((key, _) => key !== '_' && !known.includes(key));
    if (unknown.length > 0) {
        throw new Error("Unknown parameter(s): " + unknown.join(', '));
    }

    return { notebooks, docker };
}