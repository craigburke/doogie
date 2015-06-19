var journalTyping = function(args) {

    var LINE_CHARACTER_MAX = args.lineCharacterMax || 55;
    var PAN_INTERVAL = args.panInterval || 15;
    var PAN_WIDTH = args.panWidth || 100;
    var MIN_TYPING_DELAY = args.minTypingDelay || 100;
    var MAX_TYPING_DELAY = args.maxTypingDelay || 200;
    var LINE_HEIGHT = args.lineHeight || 20;
    var journal = args.journal;

    var text = [];
    var currentLine = 0;
    var positionOnLine = 0;
    var characterStartTime = 0;
    var position = {x: 0, y: 0};
    var parsingText = false;

    var nextCharacterTime = 0;

    var updatePosition = function() {
        if (currentLine >= text.length) {
            currentLine = text.length - 1;
            positionOnLine = text[text.length - 1].length - 1;
        }

        if (positionOnLine >= text[currentLine].length) {
            positionOnLine = text[currentLine].length - 1;
        }
    };

    function replaceUnsupportedCharacters(string) {
        var replacementMap = [
            {'newChar': "'", 'oldChar': /[\u2019]/g}
        ];

        for(var i=0; i < replacementMap.length; i++) {
            string = string.replace(replacementMap[i].oldChar, replacementMap[i].newChar);
        }

        return string;
    }

    var parseText = function() {
        // Break up text into lines based on LINE_CHARACTER_MAX ensuring that words don't get cropped
        parsingText = true;
        text = [];

        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var date = new Date(journal.date);
        var formattedDate = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

        var journalText = formattedDate.toUpperCase() + "... " + replaceUnsupportedCharacters(journal.text.trim());

        var position = 0;

        while (position < journalText.length) {
            var lineText = journalText.substring(position, position + LINE_CHARACTER_MAX);

            var nextCharacter = journalText.substring(position + lineText.length, position + lineText.length + 1);
            var lastSpace = lineText.lastIndexOf(' ');

            if ((text.length === 0) && (lastSpace == formattedDate.length + 3)) {
                // Ignore the initial space on the first line
                lastSpace = -1;
            }

            if (lineText.length === LINE_CHARACTER_MAX && nextCharacter !== " " && lastSpace !== -1) {
                // Breaking up a word, so let's go back
                lineText = journalText.substring(position, position + lastSpace);
            }

            position += lineText.length;
            text.push(lineText.trim());
        }

        updatePosition();
        parsingText = false;
    }

    parseText();


    return {
        typingEnabled: false,
        parseJournalText: function() {
            parseText();
        },
        getCurrentTextLines: function() {
            var value = [];
            var lineText = "";

            for (var i = 0; i <= currentLine; i++) {
                lineText = text[i];

                if (i === currentLine) {
                    lineText = text[currentLine].substring(0, positionOnLine + 1);
                }

                value.push(lineText);
            }

            return value;
        },
        setPosition: function(x, y) {
            position.x = x;
            position.y = y;
        },
        getPosition: function() {
            return {x: position.x, y: position.y};
        },
        getLastCharacterPosition: function() {
            var panCount = Math.floor(positionOnLine / PAN_INTERVAL);

            var x = panCount * PAN_WIDTH * -1;
            var y = currentLine * (LINE_HEIGHT / 2) * -1;

            return {x: x, y: y};
        },
        done: function() {
            return (currentLine === text.length - 1 && positionOnLine === text[currentLine].length - 1);
        },
        isReady: function() {
            return !parsingText;
        },
        nextCharacter: function(time) {
            if (this.done()) {
                return false;
            }

            var positionChanged = false;

            if  (time >= nextCharacterTime) {
                positionOnLine++;
                characterStartTime = time;
                positionChanged = true;
            }

            if (text[currentLine].length <= positionOnLine) {
                positionOnLine = 0;
                currentLine++;
            }

            if (positionChanged) {
                var delay = Math.random() * (MAX_TYPING_DELAY - MIN_TYPING_DELAY) + MIN_TYPING_DELAY;
                nextCharacterTime += delay;
            }

            return positionChanged;
        }
    }

};