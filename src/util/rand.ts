function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function getRandomCombination<T>(array: T[], k: number): T[] {
    let result: T[] = [];
    getRandomIndices(array.length, k).forEach(idx => result.push(array[idx]));
    return result;
}

function getRandomIndices(n: number, k: number): number[] {
    let indices = [...Array(n).keys()];
    shuffleArray(indices);
    return indices.slice(0, k);
}

function shuffleArray<T>(array: T[]) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = getRandomInt(currentIndex--);
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
}