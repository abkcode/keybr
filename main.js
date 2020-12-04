var app = new Vue({
  el: "#app",
  data: {
    words: [],
    wordLength: 20,
    stats: {
      speed: 0,
      speedAvg: 0,
      speedChange: 0,
      errors: 0,
      errorsAvg: 0,
      errorsChange: 0,
      score: 0,
      scoreAvg: 0,
      scoreChange: 0,
    },
    typingStart: 0,
    currentKeySet: [],
    keySet: [
      { keyValue: "e", total: 0, wrong: 0, accuracy: -1, accuracyChange: 0 },
      { keyValue: "n", total: 0, wrong: 0, accuracy: -1, accuracyChange: 0 },
      { keyValue: "i", total: 0, wrong: 0, accuracy: -1, accuracyChange: 0 },
      { keyValue: "t", total: 0, wrong: 0, accuracy: -1, accuracyChange: 0 },
      { keyValue: "r", total: 0, wrong: 0, accuracy: -1, accuracyChange: 0 },
      { keyValue: "l", total: 0, wrong: 0, accuracy: -1, accuracyChange: 0 },
      { keyValue: "s", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "a", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "u", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "o", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "d", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "y", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "c", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "h", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "g", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "m", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "p", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "b", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "k", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "v", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "w", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "f", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "z", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "x", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "q", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
      { keyValue: "j", total: 0, wrong: 0, accuracy: -2, accuracyChange: 0 },
    ],
    textFragment: [],
    wrongKeys: 0,
  },
  created: function () {
    let self = this;
    if (localStorage.getItem("keySet")) {
      self.keySet = JSON.parse(localStorage.getItem("keySet"));
    }
    if (localStorage.getItem("stats")) {
      self.stats = JSON.parse(localStorage.getItem("stats"));
    }
    self.calcAccuracy();
    this.loadWordsJSON(function (response) {
      self.words = JSON.parse(response);
      self.loadTextFragment();
      window.addEventListener("keyup", self.checkTyping);
    });
  },
  methods: {
    loadWordsJSON(callback) {
      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open("GET", "assets/words_dictionary.json", true);
      xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          callback(xobj.responseText);
        }
      };
      xobj.send(null);
    },
    loadTextFragment() {
      let words = [];
      let min = 0;
      let max = this.words.length - 1;
      let unavailableChars = [];
      for (let i = 0; i < this.keySet.length; i++) {
        if (this.keySet[i].accuracy == -2) {
          unavailableChars.push(this.keySet[i].keyValue);
        }
      }

      while (words.length < this.wordLength) {
        let rand = parseInt(Math.random() * (max - min) + min);
        let word = this.words[rand];
        let isCurrent = 0;

        // word should include any character from current keyset
        for (let i = 0; i < this.currentKeySet.length; i++) {
          if (word.indexOf(this.currentKeySet[i].keyValue) != -1) {
            isCurrent = 1;
            break;
          }
        }

        if (isCurrent && words.length) {
          let firstCurrentKeyCount = 0;
          for (let i = 0; i < words.length; i++) {
            if (words[i].indexOf(this.currentKeySet[0].keyValue) != -1) {
              firstCurrentKeyCount++;
            }
          }
          // 50% words should include current first character
          if (word.indexOf(this.currentKeySet[0].keyValue) == -1 && (firstCurrentKeyCount * 100) / words.length < 50) {
            isCurrent = 0;
          }
        }

        if (isCurrent) {
          // word should not include characters which are not unlocked yet
          for (let i = 0; i < unavailableChars.length; i++) {
            if (word.indexOf(unavailableChars[i]) != -1) {
              isCurrent = 0;
              break;
            }
          }
        }

        if (isCurrent) {
          words.push(word);
        }
      }
      let textFragment = [];
      for (let i = 0; i < words.length; i++) {
        for (let j = 0; j < words[i].length; j++) {
          textFragment.push({ keyValue: words[i].charAt(j), madeError: 0, isCurrent: 0 });
        }
        textFragment.push({ keyValue: "␣", madeError: 0, isCurrent: 0 });
      }
      textFragment[0].isCurrent = 1;
      this.textFragment = textFragment;
    },
    checkTyping(e) {
      for (let i = 0; i < this.textFragment.length; i++) {
        if (this.textFragment[i].isCurrent) {
          if (i == 0) {
            this.typingStart = Date.now();
          }
          if (this.textFragment[i].keyValue == e.key || (this.textFragment[i].keyValue == "␣" && e.key == " ")) {
            if (this.wrongKeys) {
              this.textFragment[i].madeError = 1;
              this.updateWrong(e.key);
            }
            this.updateTotal(e.key);
            this.wrongKeys = 0;
            this.textFragment[i].isCurrent = 0;
            if (i < this.textFragment.length - 1) {
              this.textFragment[i + 1].isCurrent = 1;
            } else {
              this.calcStats();
              this.calcAccuracy();
              this.loadTextFragment();
            }
          } else {
            this.wrongKeys++;
          }
          break;
        }
      }
    },
    updateWrong(keyValue) {
      if (keyValue != " ") {
        for (let i = 0; i < this.keySet.length; i++) {
          if (this.keySet[i].keyValue == keyValue) {
            this.keySet[i].wrong++;
            break;
          }
        }
      }
    },
    updateTotal(keyValue) {
      if (keyValue != " ") {
        for (let i = 0; i < this.keySet.length; i++) {
          if (this.keySet[i].keyValue == keyValue) {
            this.keySet[i].total++;
            break;
          }
        }
      }
    },
    calcStats() {
      this.stats.speed = this.textFragment.length / 5 / ((Date.now() - this.typingStart) / 60000);
      if (this.stats.speedAvg == 0) {
        this.stats.speedAvg = this.stats.speed;
      } else {
        this.stats.speedAvg = (this.stats.speedAvg + this.stats.speed) / 2;
      }
      this.stats.speedChange = this.stats.speed - this.stats.speedAvg;

      let errors = 0;
      for (let i = 0; i < this.textFragment.length; i++) {
        if (this.textFragment[i].madeError) {
          errors++;
        }
      }
      this.stats.errors = errors;
      if (this.stats.errorsAvg == 0) {
        this.stats.errorsAvg = this.stats.errors;
      } else {
        this.stats.errorsAvg = (this.stats.errorsAvg + this.stats.errors) / 2;
      }
      this.stats.errorsChange = this.stats.errors - this.stats.errorsAvg;
      this.stats.score = (this.stats.speed - this.stats.errors / 2) * 123;
      if (this.stats.scoreAvg == 0) {
        this.stats.scoreAvg = this.stats.score;
      } else {
        this.stats.scoreAvg = (this.stats.scoreAvg + this.stats.score) / 2;
      }
      this.stats.scoreChange = this.stats.score - this.stats.scoreAvg;
      localStorage.setItem("stats", JSON.stringify(this.stats));
    },
    calcAccuracy() {
      for (let i = 0; i < this.keySet.length; i++) {
        if (this.keySet[i].total > 20) {
          let newAccuracy = ((this.keySet[i].total - this.keySet[i].wrong) * 100) / this.keySet[i].total;
          this.keySet[i].accuracyChange = newAccuracy - Math.max(0, this.keySet[i].accuracy);
          this.keySet[i].accuracy = newAccuracy;
        }
      }

      let includeNew = 1;
      for (let i = 0; i < this.keySet.length; i++) {
        // unlock new character when current keys acuracry is above 90
        if (this.keySet[i].accuracy != -2 && this.keySet[i].accuracy < 90) {
          includeNew = 0;
          break;
        }
      }

      if (includeNew) {
        for (let i = 0; i < this.keySet.length; i++) {
          if (this.keySet[i].accuracy == -2) {
            this.keySet[i].accuracy = -1;
            break;
          }
        }
      }

      let currentKeySet = this.keySet.filter(function (obj) {
        return obj.accuracy != -2;
      });
      currentKeySet.sort(function (a, b) {
        return a.accuracy > b.accuracy ? 1 : -1;
      });
      this.currentKeySet = currentKeySet.splice(0, 3);

      localStorage.setItem("keySet", JSON.stringify(this.keySet));
    },
  },
});
