"use babel";
Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RIndent = (function () {
    function RIndent() {
        _classCallCheck(this, RIndent);
    }

    _createClass(RIndent, [{
        key: "properlyIndent",
        value: function properlyIndent() {
            this.editor = atom.workspace.getActiveTextEditor();
            if (!atom.workspace.isTextEditor(this.editor)) {
                return;
            }
            var language = this.editor.getGrammar().scopeName.substring(0, 13);

            // Make sure this is a Python file
            if (language !== "source.r" && language !== "text.md" && language !== "source.python") {
                return;
            }

            // Get base variables
            var row = this.editor.getCursorBufferPosition().row;
            var col = this.editor.getCursorBufferPosition().column;

            // Parse the entire file up to the current point, keeping track of brackets
            var lines = this.editor.getTextInBufferRange([[0, 0], [row, col]]).split("\n");

            // At this point, the newline character has just been added,
            // so remove the last element of lines, which will be the empty line
            lines = lines.splice(0, lines.length - 1);
            var parseOutput = this.parseLines(lines);

            // openBracketStack: A stack of [row, col] pairs describing where open brackets are
            // lastClosedRow: Either empty, or an array [rowOpen, rowClose] describing the rows
            //  here the last bracket to be closed was opened and closed.
            // shouldHang: A stack containing the row number where each bracket was closed.
            // lastColonRow: The last row a def/for/if/elif/else/try/except etc. block started
            var openBracketStack = parseOutput.openBracketStack;
            var lastClosedRow = parseOutput.lastClosedRow;
            var shouldHang = parseOutput.shouldHang;
            var lastColonRow = parseOutput.lastColonRow;

            // always indent if line ends with assignment
            var indentforassignment = this.endsWithAssignment(lines[row - 1]);

            if (indentforassignment) {
                var indentLevel = this.editor.indentationForBufferRow(row - 1) + 1;
                this.editor.setIndentationForBufferRow(row, indentLevel);
                return;
            }

            if (shouldHang || indentforassignment) {
                this.indentHanging(row, this.editor.buffer.lineForRow(row - 1));
                return;
            }
            // if we haven't started any parenthesis yet
            if (!(openBracketStack.length || lastClosedRow.length && openBracketStack)) {
                var previousline = "";
                var indentLevel = 0;
                var previouslinenumber = row - 1;
                if (previouslinenumber > 0) {
                    previousline = lines[previouslinenumber];
                    var previousindent = this.editor.indentationForBufferRow(row - 1);
                    var _indentLevel = this.indentBinary(lines[row - 1], previousline, previousindent);
                } else {
                    var previousindent = false;
                    var _indentLevel2 = 0;
                }

                //
                //
                // }

                this.editor.setIndentationForBufferRow(row, indentLevel);
                this.editor.setIndentationForBufferRow(row, indentLevel);

                return;
            }
            // we've had parenthesis, but they're all closed
            if (!openBracketStack.length) {
                // Can assume lastClosedRow is not empty
                if (lastClosedRow[1] === row - 1) {
                    // We just closed a bracket on the row, get indentation from the
                    // row where it was opened
                    var indentLevel = this.editor.indentationForBufferRow(lastClosedRow[0]);
                    var currentline = lines[lastClosedRow[1]];
                    var previousclosedline = "";
                    var previousclosedlinenumber = lastClosedRow[0] - 1;
                    if (previousclosedlinenumber > -1) {
                        previousclosedline = lines[lastClosedRow[0] - 1];
                    }
                    indentLevel = this.indentBinary(currentline, previousclosedline, indentLevel);

                    if (lastColonRow === row - 1) {
                        // We just finished def/for/if/elif/else/try/except etc. block,
                        // need to increase indent level by 1.
                        indentLevel += 1;
                    }
                    this.editor.setIndentationForBufferRow(row, indentLevel);
                    if (indentLevel >= 2 && lastColonRow === row - 1) {
                        var nextrow = row + 1;
                        this.editor.setIndentationForBufferRow(nextrow, indentLevel - 1);
                    }
                } else {
                    var previousline = "";
                    var previouslinenumber = row - 1;
                    if (previouslinenumber > 0) {
                        previousline = lines[previouslinenumber];
                        var previousindent = this.editor.indentationForBufferRow(row - 1);
                        var indentLevel = this.indentBinary(lines[row - 1], previousline, previousindent);
                        this.editor.setIndentationForBufferRow(row, indentLevel);
                    } else {
                        previousline = "";
                        var previousindent = false;
                        var indentLevel = 0;
                        this.editor.setIndentationForBufferRow(row, indentLevel);
                    }
                }
                return;
            }
            // Get tab length for context
            var tabLength = this.editor.getTabLength();

            var lastOpenBracketLocations = openBracketStack.pop();

            // Get some booleans to help work through the cases

            // haveClosedBracket is true if we have ever closed a bracket
            var haveClosedBracket = lastClosedRow.length;
            // justOpenedBracket is true if we opened a bracket on the row we just finished
            var justOpenedBracket = lastOpenBracketLocations[0] === row - 1;
            // justClosedBracket is true if we closed a bracket on the row we just finished
            var justClosedBracket = haveClosedBracket && lastClosedRow[1] === row - 1;
            // closedBracketOpenedAfterLineWithCurrentOpen is an ***extremely*** long name, and
            // it is true if the most recently closed bracket pair was opened on
            // a line AFTER the line where the current open bracket
            var closedBracketOpenedAfterLineWithCurrentOpen = haveClosedBracket && lastClosedRow[0] > lastOpenBracketLocations[0];
            var indentColumn = undefined;
            if (!justOpenedBracket && !justClosedBracket) {
                // The bracket was opened before the previous line,
                // and we did not close a bracket on the previous line.
                // Thus, nothing has happened that could have changed the
                // indentation level since the previous line, so
                // we should use whatever indent we are given.
                return;
            } else if (justClosedBracket && closedBracketOpenedAfterLineWithCurrentOpen) {
                // A bracket that was opened after the most recent open
                // bracket was closed on the line we just finished typing.
                // We should use whatever indent was used on the row
                // where we opened the bracket we just closed. This needs
                // to be handled as a separate case from the last case below
                // in case the current bracket is using a hanging indent.
                // This handles cases such as
                // x = [0, 1, 2,
                //      [3, 4, 5,
                //       6, 7, 8],
                //      9, 10, 11]
                // which would be correctly handled by the case below, but it also correctly handles
                // x = [
                //     0, 1, 2, [3, 4, 5,
                //               6, 7, 8],
                //     9, 10, 11
                // ]
                // which the last case below would incorrectly indent an extra space
                // before the "9", because it would try to match it up with the
                // open bracket instead of using the hanging indent.
                var previousIndent = this.editor.indentationForBufferRow(lastClosedRow[0]);
                indentColumn = previousIndent * tabLength;
            } else {
                // lastOpenBracketLocations[1] is the column where the bracket was,
                // so need to bump up the indentation by one
                if (lastColonRow === lastClosedRow[1]) {
                    var indentationRow = lastClosedRow[0];
                    var indentLevel = this.editor.indentationForBufferRow(indentationRow);
                    indentLevel += 1;
                    this.editor.setIndentationForBufferRow(row, indentLevel);
                    var nextrow = row + 1;
                    this.editor.setIndentationForBufferRow(nextrow, indentLevel - 1);
                    return;
                }
                indentColumn = lastOpenBracketLocations[1] + 1;
            }

            // Calculate soft-tabs from spaces (can have remainder)
            var tabs = indentColumn / tabLength;
            var rem = (tabs - Math.floor(tabs)) * tabLength;

            // If there's a remainder, `@editor.buildIndentString` requires the tab to
            // be set past the desired indentation level, thus the ceiling.
            tabs = rem > 0 ? Math.ceil(tabs) : tabs;

            // Offset is the number of spaces to subtract from the soft-tabs if they
            // are past the desired indentation (not divisible by tab length).
            var offset = rem > 0 ? tabLength - rem : 0;

            // I'm glad Atom has an optional `column` param to subtract spaces from
            // soft-tabs, though I don't see it used anywhere in the core.
            // It looks like for hard tabs, the "tabs" input can be fractional and
            // the "column" input is ignored...?
            var indent = this.editor.buildIndentString(tabs, offset);

            // The range of text to replace with our indent
            // will need to change this for hard tabs, especially tricky for when
            // hard tabs have mixture of tabs + spaces, which they can judging from
            // the editor.buildIndentString function
            var startRange = [row, 0];
            var stopRange = [row, this.editor.indentationForBufferRow(row) * tabLength];
            this.editor.getBuffer().setTextInRange([startRange, stopRange], indent);
        }
    }, {
        key: "containsPlus",
        value: function containsPlus(line) {
            var hasPlus = false;
            var c = line[line.length - 1];
            if (c === "+") {
                hasPlus = true;
            }
            return hasPlus;
        }
    }, {
        key: "endsWithAssignment",
        value: function endsWithAssignment(line) {
            var endswithassignment = false;
            if (line !== undefined) {
                if (line.endsWith("<-")) {
                    endswithassignment = true;
                }
            } else {
                line = "";
            }

            return endswithassignment;
        }
    }, {
        key: "containsPipe",
        value: function containsPipe(line) {
            var hasPipe = false;
            if (line.endsWith("%>%") || line.endsWith("%$%") || line.endsWith("%T>%") || line.endsWith("%<>%")) {
                hasPipe = true;
            }
            return hasPipe;
        }
    }, {
        key: "indentPlus",
        value: function indentPlus(currentfunctionline, previousfunctionline) {
            var indentforplus = false;
            var plusatline = this.containsPlus(currentfunctionline);
            if (previousfunctionline.length > 1) {
                var plusaboveline = this.containsPlus(previousfunctionline);
                var assignmentaboveline = this.endsWithAssignment(previousfunctionline);
                if (plusatline && !plusaboveline && !assignmentaboveline) {
                    indentforplus = true;
                }
            } else {
                if (plusatline) {
                    indentforplus = true;
                }
            }
            return indentforplus;
        }
    }, {
        key: "deindentPlus",
        value: function deindentPlus(currentfunctionline, previousfunctionline) {
            var deindentforplus = false;
            var plusatline = this.containsPlus(currentfunctionline);
            if (previousfunctionline.length > 1) {
                var plusaboveline = this.containsPlus(previousfunctionline);
                if (!plusatline && plusaboveline) {
                    deindentforplus = true;
                }
            }
            return deindentforplus;
        }
    }, {
        key: "indentPipe",
        value: function indentPipe(currentfunctionline, previousfunctionline) {
            var indentforpipe = false;
            var pipeatline = this.containsPipe(currentfunctionline);
            if (previousfunctionline.length > 1) {
                var pipeaboveline = this.containsPipe(previousfunctionline);
                var assignmentaboveline = this.endsWithAssignment(previousfunctionline);
                if (pipeatline && !pipeaboveline && !assignmentaboveline) {
                    indentforpipe = true;
                }
            } else {
                if (pipeatline) {
                    indentforpipe = true;
                }
            }
            return indentforpipe;
        }
    }, {
        key: "deindentPipe",
        value: function deindentPipe(currentfunctionline, previousfunctionline) {
            var deindentforpipe = false;
            var pipeatline = this.containsPipe(currentfunctionline);
            if (previousfunctionline.length > 1) {
                var pipeaboveline = this.containsPipe(previousfunctionline);
                if (!pipeatline && pipeaboveline) {
                    deindentforpipe = true;
                }
            }
            return deindentforpipe;
        }
    }, {
        key: "indentBinary",
        value: function indentBinary(currentline, previousclosedline, currentIndentLevel) {
            var indentforplus = this.indentPlus(currentline, previousclosedline);
            var deindentforplus = this.deindentPlus(currentline, previousclosedline);
            var indentforpipe = this.indentPipe(currentline, previousclosedline);
            var deindentforpipe = this.deindentPipe(currentline, previousclosedline);
            var newindentlevel = currentIndentLevel;
            if (indentforplus || indentforpipe) {
                newindentlevel += 1;
            }
            if (deindentforplus || deindentforpipe) {
                newindentlevel -= 1;
            }
            return newindentlevel;
        }
    }, {
        key: "parseLines",
        value: function parseLines(lines) {
            // openBracketStack is an array of [row, col] indicating the location
            // of the opening bracket (square, curly, or parentheses)
            var openBracketStack = [];
            // lastClosedRow is either empty or [rowOpen, rowClose] describing the
            // rows where the latest closed bracket was opened and closed.
            var lastClosedRow = [];
            // If we are in a string, this tells us what character introduced the string
            // i.e., did this string start with ' or with "?
            var stringDelimiter = [];
            // This is the row of the last function definition
            var lastColonRow = NaN;

            // true if we are in a triple quoted string
            var inTripleQuotedString = false;

            // If we have seen two of the same string delimiters in a row,
            // then we have to check the next character to see if it matches
            // in order to correctly parse triple quoted strings.
            var checkNextCharForString = false;

            // keep track of the number of consecutive string delimiter's we've seen
            // used to tell if we are in a triple quoted string
            var numConsecutiveStringDelimiters = 0;

            // true if we should have a hanging indent, false otherwise
            var shouldHang = false;
            // NOTE: this parsing will only be correct if the python code is well-formed
            // statements like "[0, (1, 2])" might break the parsing
            // loop over each line
            for (var row of Array(lines.length).fill().map(function (_, i) {
                return i;
            })) {
                var line = lines[row];

                // boolean, whether or not the current character is being escaped
                // applicable when we are currently in a string
                var isEscaped = false;

                // This is the last defined def/for/if/elif/else/try/except row
                var lastlastColonRow = lastColonRow;

                for (var col of Array(line.length).fill().map(function (_, i) {
                    return i;
                })) {
                    var c = line[col];

                    if (c === stringDelimiter && !isEscaped) {
                        numConsecutiveStringDelimiters += 1;
                    } else if (checkNextCharForString) {
                        numConsecutiveStringDelimiters = 0;
                        stringDelimiter = [];
                    } else {
                        numConsecutiveStringDelimiters = 0;
                    }

                    checkNextCharForString = false;

                    // If stringDelimiter is set, then we are in a string
                    // Note that this works correctly even for triple quoted strings
                    if (stringDelimiter.length) {
                        if (isEscaped) {
                            // If current character is escaped, then we do not care what it was,
                            // but since it is impossible for the next character to be escaped as well,
                            // go ahead and set that to false
                            isEscaped = false;
                        } else {
                            if (c === stringDelimiter) {
                                // We are seeing the same quote that started the string, i.e. ' or "
                                if (inTripleQuotedString) {
                                    if (numConsecutiveStringDelimiters === 3) {
                                        // Breaking out of the triple quoted string...
                                        numConsecutiveStringDelimiters = 0;
                                        stringDelimiter = [];
                                        inTripleQuotedString = false;
                                    }
                                } else if (numConsecutiveStringDelimiters === 3) {
                                    // reset the count, correctly handles cases like ''''''
                                    numConsecutiveStringDelimiters = 0;
                                    inTripleQuotedString = true;
                                } else if (numConsecutiveStringDelimiters === 2) {
                                    // We are not currently in a triple quoted string, and we've
                                    // seen two of the same string delimiter in a row. This could
                                    // either be an empty string, i.e. '' or "", or it could be
                                    // the start of a triple quoted string. We will check the next
                                    // character, and if it matches then we know we're in a triple
                                    // quoted string, and if it does not match we know we're not
                                    // in a string any more (i.e. it was the empty string).
                                    checkNextCharForString = true;
                                } else if (numConsecutiveStringDelimiters === 1) {
                                    // We are not in a string that is not triple quoted, and we've
                                    // just seen an un-escaped instance of that string delimiter.
                                    // In other words, we've left the string.
                                    // It is also worth noting that it is impossible for
                                    // numConsecutiveStringDelimiters to be 0 at this point, so
                                    // this set of if/else if statements covers all cases.
                                    stringDelimiter = [];
                                }
                            } else if (c === "\\") {
                                // We are seeing an unescaped backslash, the next character is escaped.
                                // Note that this is not exactly true in raw strings, HOWEVER, in raw
                                // strings you can still escape the quote mark by using a backslash.
                                // Since that's all we really care about as far as escaped characters
                                // go, we can assume we are now escaping the next character.
                                isEscaped = true;
                            }
                        }
                    } else {
                        if ("[(".includes(c)) {
                            openBracketStack.push([row, col]);
                            // If the only characters after this opening bracket are whitespace,
                            // then we should do a hanging indent. If there are other non-whitespace
                            // characters after this, then they will set the shouldHang boolean to false
                            shouldHang = true;
                        } else if (" \t\r\n".includes(c)) {
                            // just in case there's a new line
                            // If it's whitespace, we don't care at all
                            // this check is necessary so we don't set shouldHang to false even if
                            // someone e.g. just entered a space between the opening bracket and the
                            // newline.
                            continue;
                        } else if (c === "#") {
                            // This check goes as well to make sure we don't set shouldHang
                            // to false in similar circumstances as described in the whitespace section.
                            break;
                        } else {
                            // We've already skipped if the character was white-space, an opening
                            // bracket, or a new line, so that means the current character is not
                            // whitespace and not an opening bracket, so shouldHang needs to get set to
                            // false.
                            shouldHang = false;

                            // Similar to above, we've already skipped all irrelevant characters,
                            // so if we saw a colon earlier in this line, then we would have
                            // incorrectly thought it was the end of a def/for/if/elif/else/try/except
                            // block when it was actually a dictionary being defined, reset the
                            // lastColonRow variable to whatever it was when we started parsing this
                            // line.
                            lastColonRow = lastlastColonRow;

                            // if (c === "{")
                            if ("{".includes(c)) {
                                lastColonRow = row;
                            } else if (")]".includes(c) && openBracketStack.length) {
                                // The .pop() will take the element off of the openBracketStack as it
                                // adds it to the array for lastClosedRow.
                                lastClosedRow = [openBracketStack.pop()[0], row];
                            } else if ("'\"".includes(c)) {
                                // Starting a string, keep track of what quote was used to start it.
                                stringDelimiter = c;
                                numConsecutiveStringDelimiters += 1;
                            }
                        }
                    }
                }
            }
            return { openBracketStack: openBracketStack, lastClosedRow: lastClosedRow, shouldHang: shouldHang, lastColonRow: lastColonRow };
        }
    }, {
        key: "indentHanging",
        value: function indentHanging(row) {
            // Indent at the current block level plus the setting amount (1 or 2)
            var indent = this.editor.indentationForBufferRow(row) + atom.config.get("python-indent.hangingIndentTabs");

            // Set the indent
            this.editor.setIndentationForBufferRow(row, indent);
        }
    }]);

    return RIndent;
})();

exports["default"] = RIndent;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vkc2FuZG9yZi8uYXRvbS9wYWNrYWdlcy9hdG9tLWxhbmd1YWdlLXIvaW5zdC9yLWluZGVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7OztJQUNTLE9BQU87YUFBUCxPQUFPOzhCQUFQLE9BQU87OztpQkFBUCxPQUFPOztlQUNWLDBCQUFHO0FBQ2IsZ0JBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ25ELGdCQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzNDLHVCQUFPO2FBQ1Y7QUFDRCxnQkFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs7O0FBR3JFLGdCQUFJLFFBQVEsS0FBSyxVQUFVLElBQUksUUFBUSxLQUFLLFNBQVMsSUFBSSxRQUFRLEtBQUssZUFBZSxFQUFFO0FBQ25GLHVCQUFPO2FBQ1Y7OztBQUdELGdCQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3RELGdCQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsTUFBTSxDQUFDOzs7QUFHekQsZ0JBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7O0FBSy9FLGlCQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FB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QXVCLENBQUMsR0FBRyxDQUFDLEdBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLEFBQUMsQ0FBQzs7O0FBR3pELGdCQUFJLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN2RDs7O1dBdmRnQixPQUFPOzs7cUJBQVAsT0FBTyIsImZpbGUiOiIvaG9tZS9lZHNhbmRvcmYvLmF0b20vcGFja2FnZXMvYXRvbS1sYW5ndWFnZS1yL2luc3Qvci1pbmRlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUkluZGVudCB7XG4gICAgcHJvcGVybHlJbmRlbnQoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBpZiAoIWF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcih0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsYW5ndWFnZSA9IHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuc3Vic3RyaW5nKDAsIDEzKTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhpcyBpcyBhIFB5dGhvbiBmaWxlXG4gICAgICAgIGlmIChsYW5ndWFnZSAhPT0gXCJzb3VyY2UuclwiICYmIGxhbmd1YWdlICE9PSBcInRleHQubWRcIiAmJiBsYW5ndWFnZSAhPT0gXCJzb3VyY2UucHl0aG9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBiYXNlIHZhcmlhYmxlc1xuICAgICAgICBjb25zdCByb3cgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdztcbiAgICAgICAgY29uc3QgY29sID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5jb2x1bW47XG5cbiAgICAgICAgLy8gUGFyc2UgdGhlIGVudGlyZSBmaWxlIHVwIHRvIHRoZSBjdXJyZW50IHBvaW50LCBrZWVwaW5nIHRyYWNrIG9mIGJyYWNrZXRzXG4gICAgICAgIGxldCBsaW5lcyA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbMCwgMF0sIFtyb3csIGNvbF1dKS5zcGxpdChcIlxcblwiKTtcblxuXG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSBuZXdsaW5lIGNoYXJhY3RlciBoYXMganVzdCBiZWVuIGFkZGVkLFxuICAgICAgICAvLyBzbyByZW1vdmUgdGhlIGxhc3QgZWxlbWVudCBvZiBsaW5lcywgd2hpY2ggd2lsbCBiZSB0aGUgZW1wdHkgbGluZVxuICAgICAgICBsaW5lcyA9IGxpbmVzLnNwbGljZSgwLCBsaW5lcy5sZW5ndGggLSAxKTtcbiAgICAgICAgY29uc3QgcGFyc2VPdXRwdXQgPSB0aGlzLnBhcnNlTGluZXMobGluZXMpO1xuXG4gICAgICAgIC8vIG9wZW5CcmFja2V0U3RhY2s6IEEgc3RhY2sgb2YgW3JvdywgY29sXSBwYWlycyBkZXNjcmliaW5nIHdoZXJlIG9wZW4gYnJhY2tldHMgYXJlXG4gICAgICAgIC8vIGxhc3RDbG9zZWRSb3c6IEVpdGhlciBlbXB0eSwgb3IgYW4gYXJyYXkgW3Jvd09wZW4sIHJvd0Nsb3NlXSBkZXNjcmliaW5nIHRoZSByb3dzXG4gICAgICAgIC8vICBoZXJlIHRoZSBsYXN0IGJyYWNrZXQgdG8gYmUgY2xvc2VkIHdhcyBvcGVuZWQgYW5kIGNsb3NlZC5cbiAgICAgICAgLy8gc2hvdWxkSGFuZzogQSBzdGFjayBjb250YWluaW5nIHRoZSByb3cgbnVtYmVyIHdoZXJlIGVhY2ggYnJhY2tldCB3YXMgY2xvc2VkLlxuICAgICAgICAvLyBsYXN0Q29sb25Sb3c6IFRoZSBsYXN0IHJvdyBhIGRlZi9mb3IvaWYvZWxpZi9lbHNlL3RyeS9leGNlcHQgZXRjLiBibG9jayBzdGFydGVkXG4gICAgICAgIGNvbnN0IHsgb3BlbkJyYWNrZXRTdGFjaywgbGFzdENsb3NlZFJvdywgc2hvdWxkSGFuZywgbGFzdENvbG9uUm93IH0gPSBwYXJzZU91dHB1dDtcblxuICAgICAgICAvLyBhbHdheXMgaW5kZW50IGlmIGxpbmUgZW5kcyB3aXRoIGFzc2lnbm1lbnRcbiAgICAgICAgY29uc3QgaW5kZW50Zm9yYXNzaWdubWVudCA9IHRoaXMuZW5kc1dpdGhBc3NpZ25tZW50KGxpbmVzW3JvdyAtIDFdKTtcblxuICAgICAgICBpZiAoaW5kZW50Zm9yYXNzaWdubWVudCkge1xuICAgICAgICAgICAgY29uc3QgaW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cgLSAxKSArIDE7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3csIGluZGVudExldmVsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzaG91bGRIYW5nIHx8IGluZGVudGZvcmFzc2lnbm1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZW50SGFuZ2luZyhyb3csIHRoaXMuZWRpdG9yLmJ1ZmZlci5saW5lRm9yUm93KHJvdyAtIDEpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiB3ZSBoYXZlbid0IHN0YXJ0ZWQgYW55IHBhcmVudGhlc2lzIHlldFxuICAgICAgICBpZiAoIShvcGVuQnJhY2tldFN0YWNrLmxlbmd0aCB8fCAobGFzdENsb3NlZFJvdy5sZW5ndGggJiYgb3BlbkJyYWNrZXRTdGFjaykpKSB7XG4gICAgICAgICAgICBsZXQgcHJldmlvdXNsaW5lID0gXCJcIjtcbiAgICAgICAgICAgIGxldCBpbmRlbnRMZXZlbCA9IDA7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c2xpbmVudW1iZXIgPSByb3cgLSAxO1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzbGluZW51bWJlciA+IDApIHtcbiAgICAgICAgICAgICAgICBwcmV2aW91c2xpbmUgPSBsaW5lc1twcmV2aW91c2xpbmVudW1iZXJdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzaW5kZW50ID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93IC0gMSk7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZW50TGV2ZWwgPSB0aGlzLmluZGVudEJpbmFyeShsaW5lc1tyb3cgLSAxXSwgcHJldmlvdXNsaW5lLCBwcmV2aW91c2luZGVudCk7XG5cbiAgICAgICAgICAgIH0gIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzaW5kZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGV0IGluZGVudExldmVsID0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyB9XG5cblxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93LCBpbmRlbnRMZXZlbCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3csIGluZGVudExldmVsKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdlJ3ZlIGhhZCBwYXJlbnRoZXNpcywgYnV0IHRoZXkncmUgYWxsIGNsb3NlZFxuICAgICAgICBpZiAoIW9wZW5CcmFja2V0U3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBDYW4gYXNzdW1lIGxhc3RDbG9zZWRSb3cgaXMgbm90IGVtcHR5XG4gICAgICAgICAgICBpZiAobGFzdENsb3NlZFJvd1sxXSA9PT0gcm93IC0gMSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIGp1c3QgY2xvc2VkIGEgYnJhY2tldCBvbiB0aGUgcm93LCBnZXQgaW5kZW50YXRpb24gZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyByb3cgd2hlcmUgaXQgd2FzIG9wZW5lZFxuICAgICAgICAgICAgICAgIGxldCBpbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGxhc3RDbG9zZWRSb3dbMF0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRsaW5lID0gbGluZXNbbGFzdENsb3NlZFJvd1sxXV07XG4gICAgICAgICAgICAgICAgbGV0IHByZXZpb3VzY2xvc2VkbGluZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNjbG9zZWRsaW5lbnVtYmVyID0gbGFzdENsb3NlZFJvd1swXSAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzY2xvc2VkbGluZW51bWJlciA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzY2xvc2VkbGluZSA9IGxpbmVzW2xhc3RDbG9zZWRSb3dbMF0gLSAxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5kZW50TGV2ZWwgPSB0aGlzLmluZGVudEJpbmFyeShjdXJyZW50bGluZSwgcHJldmlvdXNjbG9zZWRsaW5lLCBpbmRlbnRMZXZlbCk7XG5cbiAgICAgICAgICAgICAgICBpZiAobGFzdENvbG9uUm93ID09PSByb3cgLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGp1c3QgZmluaXNoZWQgZGVmL2Zvci9pZi9lbGlmL2Vsc2UvdHJ5L2V4Y2VwdCBldGMuIGJsb2NrLFxuICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIGluY3JlYXNlIGluZGVudCBsZXZlbCBieSAxLlxuICAgICAgICAgICAgICAgICAgICBpbmRlbnRMZXZlbCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3csIGluZGVudExldmVsKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZW50TGV2ZWwgPj0gMiAmJiBsYXN0Q29sb25Sb3cgPT09IHJvdyAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dHJvdyA9IHJvdyArIDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KG5leHRyb3csIGluZGVudExldmVsIC0gMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJldmlvdXNsaW5lID0gXCJcIjtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c2xpbmVudW1iZXIgPSByb3cgLSAxO1xuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c2xpbmVudW1iZXIgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzbGluZSA9IGxpbmVzW3ByZXZpb3VzbGluZW51bWJlcl07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzaW5kZW50ID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93IC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGVudExldmVsID0gdGhpcy5pbmRlbnRCaW5hcnkobGluZXNbcm93IC0gMV0sIHByZXZpb3VzbGluZSwgcHJldmlvdXNpbmRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3csIGluZGVudExldmVsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c2xpbmUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c2luZGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRlbnRMZXZlbCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdywgaW5kZW50TGV2ZWwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEdldCB0YWIgbGVuZ3RoIGZvciBjb250ZXh0XG4gICAgICAgIGNvbnN0IHRhYkxlbmd0aCA9IHRoaXMuZWRpdG9yLmdldFRhYkxlbmd0aCgpO1xuXG4gICAgICAgIGNvbnN0IGxhc3RPcGVuQnJhY2tldExvY2F0aW9ucyA9IG9wZW5CcmFja2V0U3RhY2sucG9wKCk7XG5cbiAgICAgICAgLy8gR2V0IHNvbWUgYm9vbGVhbnMgdG8gaGVscCB3b3JrIHRocm91Z2ggdGhlIGNhc2VzXG5cbiAgICAgICAgLy8gaGF2ZUNsb3NlZEJyYWNrZXQgaXMgdHJ1ZSBpZiB3ZSBoYXZlIGV2ZXIgY2xvc2VkIGEgYnJhY2tldFxuICAgICAgICBjb25zdCBoYXZlQ2xvc2VkQnJhY2tldCA9IGxhc3RDbG9zZWRSb3cubGVuZ3RoO1xuICAgICAgICAvLyBqdXN0T3BlbmVkQnJhY2tldCBpcyB0cnVlIGlmIHdlIG9wZW5lZCBhIGJyYWNrZXQgb24gdGhlIHJvdyB3ZSBqdXN0IGZpbmlzaGVkXG4gICAgICAgIGNvbnN0IGp1c3RPcGVuZWRCcmFja2V0ID0gbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zWzBdID09PSByb3cgLSAxO1xuICAgICAgICAvLyBqdXN0Q2xvc2VkQnJhY2tldCBpcyB0cnVlIGlmIHdlIGNsb3NlZCBhIGJyYWNrZXQgb24gdGhlIHJvdyB3ZSBqdXN0IGZpbmlzaGVkXG4gICAgICAgIGNvbnN0IGp1c3RDbG9zZWRCcmFja2V0ID0gaGF2ZUNsb3NlZEJyYWNrZXQgJiYgbGFzdENsb3NlZFJvd1sxXSA9PT0gcm93IC0gMTtcbiAgICAgICAgLy8gY2xvc2VkQnJhY2tldE9wZW5lZEFmdGVyTGluZVdpdGhDdXJyZW50T3BlbiBpcyBhbiAqKipleHRyZW1lbHkqKiogbG9uZyBuYW1lLCBhbmRcbiAgICAgICAgLy8gaXQgaXMgdHJ1ZSBpZiB0aGUgbW9zdCByZWNlbnRseSBjbG9zZWQgYnJhY2tldCBwYWlyIHdhcyBvcGVuZWQgb25cbiAgICAgICAgLy8gYSBsaW5lIEFGVEVSIHRoZSBsaW5lIHdoZXJlIHRoZSBjdXJyZW50IG9wZW4gYnJhY2tldFxuICAgICAgICBjb25zdCBjbG9zZWRCcmFja2V0T3BlbmVkQWZ0ZXJMaW5lV2l0aEN1cnJlbnRPcGVuID0gaGF2ZUNsb3NlZEJyYWNrZXQgJiZcbiAgICAgICAgICAgIGxhc3RDbG9zZWRSb3dbMF0gPiBsYXN0T3BlbkJyYWNrZXRMb2NhdGlvbnNbMF07XG4gICAgICAgIGxldCBpbmRlbnRDb2x1bW47XG4gICAgICAgIGlmICghanVzdE9wZW5lZEJyYWNrZXQgJiYgIWp1c3RDbG9zZWRCcmFja2V0KSB7XG4gICAgICAgICAgICAvLyBUaGUgYnJhY2tldCB3YXMgb3BlbmVkIGJlZm9yZSB0aGUgcHJldmlvdXMgbGluZSxcbiAgICAgICAgICAgIC8vIGFuZCB3ZSBkaWQgbm90IGNsb3NlIGEgYnJhY2tldCBvbiB0aGUgcHJldmlvdXMgbGluZS5cbiAgICAgICAgICAgIC8vIFRodXMsIG5vdGhpbmcgaGFzIGhhcHBlbmVkIHRoYXQgY291bGQgaGF2ZSBjaGFuZ2VkIHRoZVxuICAgICAgICAgICAgLy8gaW5kZW50YXRpb24gbGV2ZWwgc2luY2UgdGhlIHByZXZpb3VzIGxpbmUsIHNvXG4gICAgICAgICAgICAvLyB3ZSBzaG91bGQgdXNlIHdoYXRldmVyIGluZGVudCB3ZSBhcmUgZ2l2ZW4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoanVzdENsb3NlZEJyYWNrZXQgJiYgY2xvc2VkQnJhY2tldE9wZW5lZEFmdGVyTGluZVdpdGhDdXJyZW50T3Blbikge1xuICAgICAgICAgICAgLy8gQSBicmFja2V0IHRoYXQgd2FzIG9wZW5lZCBhZnRlciB0aGUgbW9zdCByZWNlbnQgb3BlblxuICAgICAgICAgICAgLy8gYnJhY2tldCB3YXMgY2xvc2VkIG9uIHRoZSBsaW5lIHdlIGp1c3QgZmluaXNoZWQgdHlwaW5nLlxuICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIHVzZSB3aGF0ZXZlciBpbmRlbnQgd2FzIHVzZWQgb24gdGhlIHJvd1xuICAgICAgICAgICAgLy8gd2hlcmUgd2Ugb3BlbmVkIHRoZSBicmFja2V0IHdlIGp1c3QgY2xvc2VkLiBUaGlzIG5lZWRzXG4gICAgICAgICAgICAvLyB0byBiZSBoYW5kbGVkIGFzIGEgc2VwYXJhdGUgY2FzZSBmcm9tIHRoZSBsYXN0IGNhc2UgYmVsb3dcbiAgICAgICAgICAgIC8vIGluIGNhc2UgdGhlIGN1cnJlbnQgYnJhY2tldCBpcyB1c2luZyBhIGhhbmdpbmcgaW5kZW50LlxuICAgICAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGNhc2VzIHN1Y2ggYXNcbiAgICAgICAgICAgIC8vIHggPSBbMCwgMSwgMixcbiAgICAgICAgICAgIC8vICAgICAgWzMsIDQsIDUsXG4gICAgICAgICAgICAvLyAgICAgICA2LCA3LCA4XSxcbiAgICAgICAgICAgIC8vICAgICAgOSwgMTAsIDExXVxuICAgICAgICAgICAgLy8gd2hpY2ggd291bGQgYmUgY29ycmVjdGx5IGhhbmRsZWQgYnkgdGhlIGNhc2UgYmVsb3csIGJ1dCBpdCBhbHNvIGNvcnJlY3RseSBoYW5kbGVzXG4gICAgICAgICAgICAvLyB4ID0gW1xuICAgICAgICAgICAgLy8gICAgIDAsIDEsIDIsIFszLCA0LCA1LFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICA2LCA3LCA4XSxcbiAgICAgICAgICAgIC8vICAgICA5LCAxMCwgMTFcbiAgICAgICAgICAgIC8vIF1cbiAgICAgICAgICAgIC8vIHdoaWNoIHRoZSBsYXN0IGNhc2UgYmVsb3cgd291bGQgaW5jb3JyZWN0bHkgaW5kZW50IGFuIGV4dHJhIHNwYWNlXG4gICAgICAgICAgICAvLyBiZWZvcmUgdGhlIFwiOVwiLCBiZWNhdXNlIGl0IHdvdWxkIHRyeSB0byBtYXRjaCBpdCB1cCB3aXRoIHRoZVxuICAgICAgICAgICAgLy8gb3BlbiBicmFja2V0IGluc3RlYWQgb2YgdXNpbmcgdGhlIGhhbmdpbmcgaW5kZW50LlxuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNJbmRlbnQgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhsYXN0Q2xvc2VkUm93WzBdKTtcbiAgICAgICAgICAgIGluZGVudENvbHVtbiA9IHByZXZpb3VzSW5kZW50ICogdGFiTGVuZ3RoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zWzFdIGlzIHRoZSBjb2x1bW4gd2hlcmUgdGhlIGJyYWNrZXQgd2FzLFxuICAgICAgICAgICAgLy8gc28gbmVlZCB0byBidW1wIHVwIHRoZSBpbmRlbnRhdGlvbiBieSBvbmVcbiAgICAgICAgICAgIGlmIChsYXN0Q29sb25Sb3cgPT09IGxhc3RDbG9zZWRSb3dbMV0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRlbnRhdGlvblJvdyA9IGxhc3RDbG9zZWRSb3dbMF07XG4gICAgICAgICAgICAgICAgbGV0IGluZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coaW5kZW50YXRpb25Sb3cpO1xuICAgICAgICAgICAgICAgIGluZGVudExldmVsICs9IDE7XG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93LCBpbmRlbnRMZXZlbCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dHJvdyA9IHJvdyArIDE7XG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cobmV4dHJvdywgaW5kZW50TGV2ZWwgLSAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRlbnRDb2x1bW4gPSBsYXN0T3BlbkJyYWNrZXRMb2NhdGlvbnNbMV0gKyAxO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHNvZnQtdGFicyBmcm9tIHNwYWNlcyAoY2FuIGhhdmUgcmVtYWluZGVyKVxuICAgICAgICBsZXQgdGFicyA9IGluZGVudENvbHVtbiAvIHRhYkxlbmd0aDtcbiAgICAgICAgY29uc3QgcmVtID0gKHRhYnMgLSBNYXRoLmZsb29yKHRhYnMpKSAqIHRhYkxlbmd0aDtcblxuICAgICAgICAvLyBJZiB0aGVyZSdzIGEgcmVtYWluZGVyLCBgQGVkaXRvci5idWlsZEluZGVudFN0cmluZ2AgcmVxdWlyZXMgdGhlIHRhYiB0b1xuICAgICAgICAvLyBiZSBzZXQgcGFzdCB0aGUgZGVzaXJlZCBpbmRlbnRhdGlvbiBsZXZlbCwgdGh1cyB0aGUgY2VpbGluZy5cbiAgICAgICAgdGFicyA9IHJlbSA+IDAgPyBNYXRoLmNlaWwodGFicykgOiB0YWJzO1xuXG4gICAgICAgIC8vIE9mZnNldCBpcyB0aGUgbnVtYmVyIG9mIHNwYWNlcyB0byBzdWJ0cmFjdCBmcm9tIHRoZSBzb2Z0LXRhYnMgaWYgdGhleVxuICAgICAgICAvLyBhcmUgcGFzdCB0aGUgZGVzaXJlZCBpbmRlbnRhdGlvbiAobm90IGRpdmlzaWJsZSBieSB0YWIgbGVuZ3RoKS5cbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gcmVtID4gMCA/IHRhYkxlbmd0aCAtIHJlbSA6IDA7XG5cbiAgICAgICAgLy8gSSdtIGdsYWQgQXRvbSBoYXMgYW4gb3B0aW9uYWwgYGNvbHVtbmAgcGFyYW0gdG8gc3VidHJhY3Qgc3BhY2VzIGZyb21cbiAgICAgICAgLy8gc29mdC10YWJzLCB0aG91Z2ggSSBkb24ndCBzZWUgaXQgdXNlZCBhbnl3aGVyZSBpbiB0aGUgY29yZS5cbiAgICAgICAgLy8gSXQgbG9va3MgbGlrZSBmb3IgaGFyZCB0YWJzLCB0aGUgXCJ0YWJzXCIgaW5wdXQgY2FuIGJlIGZyYWN0aW9uYWwgYW5kXG4gICAgICAgIC8vIHRoZSBcImNvbHVtblwiIGlucHV0IGlzIGlnbm9yZWQuLi4/XG4gICAgICAgIGNvbnN0IGluZGVudCA9IHRoaXMuZWRpdG9yLmJ1aWxkSW5kZW50U3RyaW5nKHRhYnMsIG9mZnNldCk7XG5cbiAgICAgICAgLy8gVGhlIHJhbmdlIG9mIHRleHQgdG8gcmVwbGFjZSB3aXRoIG91ciBpbmRlbnRcbiAgICAgICAgLy8gd2lsbCBuZWVkIHRvIGNoYW5nZSB0aGlzIGZvciBoYXJkIHRhYnMsIGVzcGVjaWFsbHkgdHJpY2t5IGZvciB3aGVuXG4gICAgICAgIC8vIGhhcmQgdGFicyBoYXZlIG1peHR1cmUgb2YgdGFicyArIHNwYWNlcywgd2hpY2ggdGhleSBjYW4ganVkZ2luZyBmcm9tXG4gICAgICAgIC8vIHRoZSBlZGl0b3IuYnVpbGRJbmRlbnRTdHJpbmcgZnVuY3Rpb25cbiAgICAgICAgY29uc3Qgc3RhcnRSYW5nZSA9IFtyb3csIDBdO1xuICAgICAgICBjb25zdCBzdG9wUmFuZ2UgPSBbcm93LCB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpICogdGFiTGVuZ3RoXTtcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dEluUmFuZ2UoW3N0YXJ0UmFuZ2UsIHN0b3BSYW5nZV0sIGluZGVudCk7XG4gICAgfVxuXG4gICAgY29udGFpbnNQbHVzKGxpbmUpIHtcbiAgICAgICAgbGV0IGhhc1BsdXMgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgYyA9IGxpbmVbbGluZS5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGMgPT09IFwiK1wiKSB7XG4gICAgICAgICAgICBoYXNQbHVzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzUGx1cztcbiAgICB9XG5cbiAgICBlbmRzV2l0aEFzc2lnbm1lbnQobGluZSkge1xuICAgICAgICBsZXQgZW5kc3dpdGhhc3NpZ25tZW50ID0gZmFsc2U7XG4gICAgICAgIGlmKGxpbmUgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgaWYgKGxpbmUuZW5kc1dpdGgoXCI8LVwiKSkge1xuICAgICAgICAgICAgICBlbmRzd2l0aGFzc2lnbm1lbnQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaW5lID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbmRzd2l0aGFzc2lnbm1lbnQ7XG4gICAgfVxuXG4gICAgY29udGFpbnNQaXBlKGxpbmUpIHtcbiAgICAgICAgbGV0IGhhc1BpcGUgPSBmYWxzZTtcbiAgICAgICAgaWYgKGxpbmUuZW5kc1dpdGgoXCIlPiVcIikgfHwgbGluZS5lbmRzV2l0aChcIiUkJVwiKSB8fFxuICAgICAgICBsaW5lLmVuZHNXaXRoKFwiJVQ+JVwiKSB8fCBsaW5lLmVuZHNXaXRoKFwiJTw+JVwiKSkge1xuICAgICAgICAgICAgaGFzUGlwZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc1BpcGU7XG4gICAgfVxuXG4gICAgaW5kZW50UGx1cyhjdXJyZW50ZnVuY3Rpb25saW5lLCBwcmV2aW91c2Z1bmN0aW9ubGluZSkge1xuICAgICAgICBsZXQgaW5kZW50Zm9ycGx1cyA9IGZhbHNlO1xuICAgICAgICBjb25zdCBwbHVzYXRsaW5lID0gdGhpcy5jb250YWluc1BsdXMoY3VycmVudGZ1bmN0aW9ubGluZSk7XG4gICAgICAgIGlmIChwcmV2aW91c2Z1bmN0aW9ubGluZS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBjb25zdCBwbHVzYWJvdmVsaW5lID0gdGhpcy5jb250YWluc1BsdXMocHJldmlvdXNmdW5jdGlvbmxpbmUpO1xuICAgICAgICAgICAgY29uc3QgYXNzaWdubWVudGFib3ZlbGluZSA9IHRoaXMuZW5kc1dpdGhBc3NpZ25tZW50KHByZXZpb3VzZnVuY3Rpb25saW5lKTtcbiAgICAgICAgICAgIGlmIChwbHVzYXRsaW5lICYmICFwbHVzYWJvdmVsaW5lICYmICFhc3NpZ25tZW50YWJvdmVsaW5lKSB7XG4gICAgICAgICAgICAgICAgaW5kZW50Zm9ycGx1cyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocGx1c2F0bGluZSkge1xuICAgICAgICAgICAgICAgIGluZGVudGZvcnBsdXMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmRlbnRmb3JwbHVzO1xuICAgIH1cblxuICAgIGRlaW5kZW50UGx1cyhjdXJyZW50ZnVuY3Rpb25saW5lLCBwcmV2aW91c2Z1bmN0aW9ubGluZSkge1xuICAgICAgICBsZXQgZGVpbmRlbnRmb3JwbHVzID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHBsdXNhdGxpbmUgPSB0aGlzLmNvbnRhaW5zUGx1cyhjdXJyZW50ZnVuY3Rpb25saW5lKTtcbiAgICAgICAgaWYgKHByZXZpb3VzZnVuY3Rpb25saW5lLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHBsdXNhYm92ZWxpbmUgPSB0aGlzLmNvbnRhaW5zUGx1cyhwcmV2aW91c2Z1bmN0aW9ubGluZSk7XG4gICAgICAgICAgICBpZiAoIXBsdXNhdGxpbmUgJiYgcGx1c2Fib3ZlbGluZSkge1xuICAgICAgICAgICAgICAgIGRlaW5kZW50Zm9ycGx1cyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlaW5kZW50Zm9ycGx1cztcbiAgICB9XG5cbiAgICBpbmRlbnRQaXBlKGN1cnJlbnRmdW5jdGlvbmxpbmUsIHByZXZpb3VzZnVuY3Rpb25saW5lKSB7XG4gICAgICAgIGxldCBpbmRlbnRmb3JwaXBlID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHBpcGVhdGxpbmUgPSB0aGlzLmNvbnRhaW5zUGlwZShjdXJyZW50ZnVuY3Rpb25saW5lKTtcbiAgICAgICAgaWYgKHByZXZpb3VzZnVuY3Rpb25saW5lLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHBpcGVhYm92ZWxpbmUgPSB0aGlzLmNvbnRhaW5zUGlwZShwcmV2aW91c2Z1bmN0aW9ubGluZSk7XG4gICAgICAgICAgICBjb25zdCBhc3NpZ25tZW50YWJvdmVsaW5lID0gdGhpcy5lbmRzV2l0aEFzc2lnbm1lbnQocHJldmlvdXNmdW5jdGlvbmxpbmUpO1xuICAgICAgICAgICAgaWYgKHBpcGVhdGxpbmUgJiYgIXBpcGVhYm92ZWxpbmUgJiYgIWFzc2lnbm1lbnRhYm92ZWxpbmUpIHtcbiAgICAgICAgICAgICAgICBpbmRlbnRmb3JwaXBlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChwaXBlYXRsaW5lKSB7XG4gICAgICAgICAgICAgICAgaW5kZW50Zm9ycGlwZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluZGVudGZvcnBpcGU7XG4gICAgfVxuXG4gICAgZGVpbmRlbnRQaXBlKGN1cnJlbnRmdW5jdGlvbmxpbmUsIHByZXZpb3VzZnVuY3Rpb25saW5lKSB7XG4gICAgICAgIGxldCBkZWluZGVudGZvcnBpcGUgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgcGlwZWF0bGluZSA9IHRoaXMuY29udGFpbnNQaXBlKGN1cnJlbnRmdW5jdGlvbmxpbmUpO1xuICAgICAgICBpZiAocHJldmlvdXNmdW5jdGlvbmxpbmUubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgY29uc3QgcGlwZWFib3ZlbGluZSA9IHRoaXMuY29udGFpbnNQaXBlKHByZXZpb3VzZnVuY3Rpb25saW5lKTtcbiAgICAgICAgICAgIGlmICghcGlwZWF0bGluZSAmJiBwaXBlYWJvdmVsaW5lKSB7XG4gICAgICAgICAgICAgICAgZGVpbmRlbnRmb3JwaXBlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVpbmRlbnRmb3JwaXBlO1xuICAgIH1cblxuICAgIGluZGVudEJpbmFyeShjdXJyZW50bGluZSwgcHJldmlvdXNjbG9zZWRsaW5lLCBjdXJyZW50SW5kZW50TGV2ZWwpIHtcbiAgICAgICAgY29uc3QgaW5kZW50Zm9ycGx1cyA9IHRoaXMuaW5kZW50UGx1cyhjdXJyZW50bGluZSwgcHJldmlvdXNjbG9zZWRsaW5lKTtcbiAgICAgICAgY29uc3QgZGVpbmRlbnRmb3JwbHVzID0gdGhpcy5kZWluZGVudFBsdXMoY3VycmVudGxpbmUsIHByZXZpb3VzY2xvc2VkbGluZSk7XG4gICAgICAgIGNvbnN0IGluZGVudGZvcnBpcGUgPSB0aGlzLmluZGVudFBpcGUoY3VycmVudGxpbmUsIHByZXZpb3VzY2xvc2VkbGluZSk7XG4gICAgICAgIGNvbnN0IGRlaW5kZW50Zm9ycGlwZSA9IHRoaXMuZGVpbmRlbnRQaXBlKGN1cnJlbnRsaW5lLCBwcmV2aW91c2Nsb3NlZGxpbmUpO1xuICAgICAgICBsZXQgbmV3aW5kZW50bGV2ZWwgPSBjdXJyZW50SW5kZW50TGV2ZWw7XG4gICAgICAgIGlmIChpbmRlbnRmb3JwbHVzIHx8IGluZGVudGZvcnBpcGUpIHtcbiAgICAgICAgICAgIG5ld2luZGVudGxldmVsICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlaW5kZW50Zm9ycGx1cyB8fCBkZWluZGVudGZvcnBpcGUpIHtcbiAgICAgICAgICAgIG5ld2luZGVudGxldmVsIC09IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld2luZGVudGxldmVsO1xuICAgIH1cblxuICAgIHBhcnNlTGluZXMobGluZXMpIHtcbiAgICAgICAgLy8gb3BlbkJyYWNrZXRTdGFjayBpcyBhbiBhcnJheSBvZiBbcm93LCBjb2xdIGluZGljYXRpbmcgdGhlIGxvY2F0aW9uXG4gICAgICAgIC8vIG9mIHRoZSBvcGVuaW5nIGJyYWNrZXQgKHNxdWFyZSwgY3VybHksIG9yIHBhcmVudGhlc2VzKVxuICAgICAgICBjb25zdCBvcGVuQnJhY2tldFN0YWNrID0gW107XG4gICAgICAgIC8vIGxhc3RDbG9zZWRSb3cgaXMgZWl0aGVyIGVtcHR5IG9yIFtyb3dPcGVuLCByb3dDbG9zZV0gZGVzY3JpYmluZyB0aGVcbiAgICAgICAgLy8gcm93cyB3aGVyZSB0aGUgbGF0ZXN0IGNsb3NlZCBicmFja2V0IHdhcyBvcGVuZWQgYW5kIGNsb3NlZC5cbiAgICAgICAgbGV0IGxhc3RDbG9zZWRSb3cgPSBbXTtcbiAgICAgICAgLy8gSWYgd2UgYXJlIGluIGEgc3RyaW5nLCB0aGlzIHRlbGxzIHVzIHdoYXQgY2hhcmFjdGVyIGludHJvZHVjZWQgdGhlIHN0cmluZ1xuICAgICAgICAvLyBpLmUuLCBkaWQgdGhpcyBzdHJpbmcgc3RhcnQgd2l0aCAnIG9yIHdpdGggXCI/XG4gICAgICAgIGxldCBzdHJpbmdEZWxpbWl0ZXIgPSBbXTtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgcm93IG9mIHRoZSBsYXN0IGZ1bmN0aW9uIGRlZmluaXRpb25cbiAgICAgICAgbGV0IGxhc3RDb2xvblJvdyA9IE5hTjtcblxuICAgICAgICAvLyB0cnVlIGlmIHdlIGFyZSBpbiBhIHRyaXBsZSBxdW90ZWQgc3RyaW5nXG4gICAgICAgIGxldCBpblRyaXBsZVF1b3RlZFN0cmluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIElmIHdlIGhhdmUgc2VlbiB0d28gb2YgdGhlIHNhbWUgc3RyaW5nIGRlbGltaXRlcnMgaW4gYSByb3csXG4gICAgICAgIC8vIHRoZW4gd2UgaGF2ZSB0byBjaGVjayB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gc2VlIGlmIGl0IG1hdGNoZXNcbiAgICAgICAgLy8gaW4gb3JkZXIgdG8gY29ycmVjdGx5IHBhcnNlIHRyaXBsZSBxdW90ZWQgc3RyaW5ncy5cbiAgICAgICAgbGV0IGNoZWNrTmV4dENoYXJGb3JTdHJpbmcgPSBmYWxzZTtcblxuICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29uc2VjdXRpdmUgc3RyaW5nIGRlbGltaXRlcidzIHdlJ3ZlIHNlZW5cbiAgICAgICAgLy8gdXNlZCB0byB0ZWxsIGlmIHdlIGFyZSBpbiBhIHRyaXBsZSBxdW90ZWQgc3RyaW5nXG4gICAgICAgIGxldCBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPSAwO1xuXG4gICAgICAgIC8vIHRydWUgaWYgd2Ugc2hvdWxkIGhhdmUgYSBoYW5naW5nIGluZGVudCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICAgIGxldCBzaG91bGRIYW5nID0gZmFsc2U7XG4gICAgICAgIC8vIE5PVEU6IHRoaXMgcGFyc2luZyB3aWxsIG9ubHkgYmUgY29ycmVjdCBpZiB0aGUgcHl0aG9uIGNvZGUgaXMgd2VsbC1mb3JtZWRcbiAgICAgICAgLy8gc3RhdGVtZW50cyBsaWtlIFwiWzAsICgxLCAyXSlcIiBtaWdodCBicmVhayB0aGUgcGFyc2luZ1xuICAgICAgICAvLyBsb29wIG92ZXIgZWFjaCBsaW5lXG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIEFycmF5KGxpbmVzLmxlbmd0aCkuZmlsbCgpLm1hcCgoXywgaSkgPT4gaSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tyb3ddO1xuXG5cbiAgICAgICAgICAgIC8vIGJvb2xlYW4sIHdoZXRoZXIgb3Igbm90IHRoZSBjdXJyZW50IGNoYXJhY3RlciBpcyBiZWluZyBlc2NhcGVkXG4gICAgICAgICAgICAvLyBhcHBsaWNhYmxlIHdoZW4gd2UgYXJlIGN1cnJlbnRseSBpbiBhIHN0cmluZ1xuICAgICAgICAgICAgbGV0IGlzRXNjYXBlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBsYXN0IGRlZmluZWQgZGVmL2Zvci9pZi9lbGlmL2Vsc2UvdHJ5L2V4Y2VwdCByb3dcbiAgICAgICAgICAgIGNvbnN0IGxhc3RsYXN0Q29sb25Sb3cgPSBsYXN0Q29sb25Sb3c7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY29sIG9mIEFycmF5KGxpbmUubGVuZ3RoKS5maWxsKCkubWFwKChfLCBpKSA9PiBpKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGMgPSBsaW5lW2NvbF07XG5cbiAgICAgICAgICAgICAgICBpZiAoYyA9PT0gc3RyaW5nRGVsaW1pdGVyICYmICFpc0VzY2FwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzICs9IDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGVja05leHRDaGFyRm9yU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZ0RlbGltaXRlciA9IFtdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2hlY2tOZXh0Q2hhckZvclN0cmluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgc3RyaW5nRGVsaW1pdGVyIGlzIHNldCwgdGhlbiB3ZSBhcmUgaW4gYSBzdHJpbmdcbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgdGhpcyB3b3JrcyBjb3JyZWN0bHkgZXZlbiBmb3IgdHJpcGxlIHF1b3RlZCBzdHJpbmdzXG4gICAgICAgICAgICAgICAgaWYgKHN0cmluZ0RlbGltaXRlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRXNjYXBlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgY3VycmVudCBjaGFyYWN0ZXIgaXMgZXNjYXBlZCwgdGhlbiB3ZSBkbyBub3QgY2FyZSB3aGF0IGl0IHdhcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1dCBzaW5jZSBpdCBpcyBpbXBvc3NpYmxlIGZvciB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgZXNjYXBlZCBhcyB3ZWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ28gYWhlYWQgYW5kIHNldCB0aGF0IHRvIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0VzY2FwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjID09PSBzdHJpbmdEZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBhcmUgc2VlaW5nIHRoZSBzYW1lIHF1b3RlIHRoYXQgc3RhcnRlZCB0aGUgc3RyaW5nLCBpLmUuICcgb3IgXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5UcmlwbGVRdW90ZWRTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnJlYWtpbmcgb3V0IG9mIHRoZSB0cmlwbGUgcXVvdGVkIHN0cmluZy4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ0RlbGltaXRlciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5UcmlwbGVRdW90ZWRTdHJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc2V0IHRoZSBjb3VudCwgY29ycmVjdGx5IGhhbmRsZXMgY2FzZXMgbGlrZSAnJycnJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5UcmlwbGVRdW90ZWRTdHJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBub3QgY3VycmVudGx5IGluIGEgdHJpcGxlIHF1b3RlZCBzdHJpbmcsIGFuZCB3ZSd2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZWVuIHR3byBvZiB0aGUgc2FtZSBzdHJpbmcgZGVsaW1pdGVyIGluIGEgcm93LiBUaGlzIGNvdWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVpdGhlciBiZSBhbiBlbXB0eSBzdHJpbmcsIGkuZS4gJycgb3IgXCJcIiwgb3IgaXQgY291bGQgYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN0YXJ0IG9mIGEgdHJpcGxlIHF1b3RlZCBzdHJpbmcuIFdlIHdpbGwgY2hlY2sgdGhlIG5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhcmFjdGVyLCBhbmQgaWYgaXQgbWF0Y2hlcyB0aGVuIHdlIGtub3cgd2UncmUgaW4gYSB0cmlwbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVvdGVkIHN0cmluZywgYW5kIGlmIGl0IGRvZXMgbm90IG1hdGNoIHdlIGtub3cgd2UncmUgbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluIGEgc3RyaW5nIGFueSBtb3JlIChpLmUuIGl0IHdhcyB0aGUgZW1wdHkgc3RyaW5nKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tOZXh0Q2hhckZvclN0cmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgYXJlIG5vdCBpbiBhIHN0cmluZyB0aGF0IGlzIG5vdCB0cmlwbGUgcXVvdGVkLCBhbmQgd2UndmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8ganVzdCBzZWVuIGFuIHVuLWVzY2FwZWQgaW5zdGFuY2Ugb2YgdGhhdCBzdHJpbmcgZGVsaW1pdGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiBvdGhlciB3b3Jkcywgd2UndmUgbGVmdCB0aGUgc3RyaW5nLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJdCBpcyBhbHNvIHdvcnRoIG5vdGluZyB0aGF0IGl0IGlzIGltcG9zc2libGUgZm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyB0byBiZSAwIGF0IHRoaXMgcG9pbnQsIHNvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgc2V0IG9mIGlmL2Vsc2UgaWYgc3RhdGVtZW50cyBjb3ZlcnMgYWxsIGNhc2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IFwiXFxcXFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgYXJlIHNlZWluZyBhbiB1bmVzY2FwZWQgYmFja3NsYXNoLCB0aGUgbmV4dCBjaGFyYWN0ZXIgaXMgZXNjYXBlZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgdGhpcyBpcyBub3QgZXhhY3RseSB0cnVlIGluIHJhdyBzdHJpbmdzLCBIT1dFVkVSLCBpbiByYXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJpbmdzIHlvdSBjYW4gc3RpbGwgZXNjYXBlIHRoZSBxdW90ZSBtYXJrIGJ5IHVzaW5nIGEgYmFja3NsYXNoLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHRoYXQncyBhbGwgd2UgcmVhbGx5IGNhcmUgYWJvdXQgYXMgZmFyIGFzIGVzY2FwZWQgY2hhcmFjdGVyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdvLCB3ZSBjYW4gYXNzdW1lIHdlIGFyZSBub3cgZXNjYXBpbmcgdGhlIG5leHQgY2hhcmFjdGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXCJbKFwiLmluY2x1ZGVzKGMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuQnJhY2tldFN0YWNrLnB1c2goW3JvdywgY29sXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgb25seSBjaGFyYWN0ZXJzIGFmdGVyIHRoaXMgb3BlbmluZyBicmFja2V0IGFyZSB3aGl0ZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlbiB3ZSBzaG91bGQgZG8gYSBoYW5naW5nIGluZGVudC4gSWYgdGhlcmUgYXJlIG90aGVyIG5vbi13aGl0ZXNwYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFyYWN0ZXJzIGFmdGVyIHRoaXMsIHRoZW4gdGhleSB3aWxsIHNldCB0aGUgc2hvdWxkSGFuZyBib29sZWFuIHRvIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG91bGRIYW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcIiBcXHRcXHJcXG5cIi5pbmNsdWRlcyhjKSkgeyAvLyBqdXN0IGluIGNhc2UgdGhlcmUncyBhIG5ldyBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBpdCdzIHdoaXRlc3BhY2UsIHdlIGRvbid0IGNhcmUgYXQgYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGNoZWNrIGlzIG5lY2Vzc2FyeSBzbyB3ZSBkb24ndCBzZXQgc2hvdWxkSGFuZyB0byBmYWxzZSBldmVuIGlmXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzb21lb25lIGUuZy4ganVzdCBlbnRlcmVkIGEgc3BhY2UgYmV0d2VlbiB0aGUgb3BlbmluZyBicmFja2V0IGFuZCB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5ld2xpbmUuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSBcIiNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjaGVjayBnb2VzIGFzIHdlbGwgdG8gbWFrZSBzdXJlIHdlIGRvbid0IHNldCBzaG91bGRIYW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0byBmYWxzZSBpbiBzaW1pbGFyIGNpcmN1bXN0YW5jZXMgYXMgZGVzY3JpYmVkIGluIHRoZSB3aGl0ZXNwYWNlIHNlY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIGFscmVhZHkgc2tpcHBlZCBpZiB0aGUgY2hhcmFjdGVyIHdhcyB3aGl0ZS1zcGFjZSwgYW4gb3BlbmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnJhY2tldCwgb3IgYSBuZXcgbGluZSwgc28gdGhhdCBtZWFucyB0aGUgY3VycmVudCBjaGFyYWN0ZXIgaXMgbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3aGl0ZXNwYWNlIGFuZCBub3QgYW4gb3BlbmluZyBicmFja2V0LCBzbyBzaG91bGRIYW5nIG5lZWRzIHRvIGdldCBzZXQgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbHNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkSGFuZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW1pbGFyIHRvIGFib3ZlLCB3ZSd2ZSBhbHJlYWR5IHNraXBwZWQgYWxsIGlycmVsZXZhbnQgY2hhcmFjdGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvIGlmIHdlIHNhdyBhIGNvbG9uIGVhcmxpZXIgaW4gdGhpcyBsaW5lLCB0aGVuIHdlIHdvdWxkIGhhdmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluY29ycmVjdGx5IHRob3VnaHQgaXQgd2FzIHRoZSBlbmQgb2YgYSBkZWYvZm9yL2lmL2VsaWYvZWxzZS90cnkvZXhjZXB0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBibG9jayB3aGVuIGl0IHdhcyBhY3R1YWxseSBhIGRpY3Rpb25hcnkgYmVpbmcgZGVmaW5lZCwgcmVzZXQgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsYXN0Q29sb25Sb3cgdmFyaWFibGUgdG8gd2hhdGV2ZXIgaXQgd2FzIHdoZW4gd2Ugc3RhcnRlZCBwYXJzaW5nIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxpbmUuXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29sb25Sb3cgPSBsYXN0bGFzdENvbG9uUm93O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoYyA9PT0gXCJ7XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXCJ7XCIuaW5jbHVkZXMoYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29sb25Sb3cgPSByb3c7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFwiKV1cIi5pbmNsdWRlcyhjKSAmJiBvcGVuQnJhY2tldFN0YWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSAucG9wKCkgd2lsbCB0YWtlIHRoZSBlbGVtZW50IG9mZiBvZiB0aGUgb3BlbkJyYWNrZXRTdGFjayBhcyBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgaXQgdG8gdGhlIGFycmF5IGZvciBsYXN0Q2xvc2VkUm93LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDbG9zZWRSb3cgPSBbb3BlbkJyYWNrZXRTdGFjay5wb3AoKVswXSwgcm93XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXCInXFxcIlwiLmluY2x1ZGVzKGMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RhcnRpbmcgYSBzdHJpbmcsIGtlZXAgdHJhY2sgb2Ygd2hhdCBxdW90ZSB3YXMgdXNlZCB0byBzdGFydCBpdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBjO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IG9wZW5CcmFja2V0U3RhY2ssIGxhc3RDbG9zZWRSb3csIHNob3VsZEhhbmcsIGxhc3RDb2xvblJvdyB9O1xuICAgIH1cblxuICAgIGluZGVudEhhbmdpbmcocm93KSB7XG4gICAgICAgIC8vIEluZGVudCBhdCB0aGUgY3VycmVudCBibG9jayBsZXZlbCBwbHVzIHRoZSBzZXR0aW5nIGFtb3VudCAoMSBvciAyKVxuICAgICAgICBjb25zdCBpbmRlbnQgPSAodGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSkgK1xuICAgICAgICAgICAgKGF0b20uY29uZmlnLmdldChcInB5dGhvbi1pbmRlbnQuaGFuZ2luZ0luZGVudFRhYnNcIikpO1xuXG4gICAgICAgIC8vIFNldCB0aGUgaW5kZW50XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdywgaW5kZW50KTtcbiAgICB9XG59XG4iXX0=