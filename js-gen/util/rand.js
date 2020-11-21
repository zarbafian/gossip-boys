function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function getRandomCombination(array, k) {
    let result = [];
    getRandomIndices(array.length, k).forEach(idx => result.push(array[idx]));
    return result;
}
function getRandomIndices(n, k) {
    let indices = [...Array(n).keys()];
    shuffleArray(indices);
    return indices.slice(0, k);
}
function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = getRandomInt(currentIndex--);
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
}
//# sourceMappingURL=rand.js.map