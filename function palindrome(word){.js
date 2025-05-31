function palindrome(word) {
  let arr = [];
  for (let i = 0; i < word.length - 1; i--) {
    if (arr[i] == word) {
      return true;
    } else {
      return false;
    }
  }
}

palindrome('civic');
console.log(palindrome);
