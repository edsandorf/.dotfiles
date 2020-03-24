function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libRIndent = require("../lib/r-indent");

var _libRIndent2 = _interopRequireDefault(_libRIndent);

"use babel";

describe("r-indent", function () {
    var FILE_NAME = "fixtures/test_file.R";
    var buffer = null;
    var editor = null;
    var rIndent = null;

    beforeEach(function () {
        waitsForPromise(function () {
            return atom.workspace.open(FILE_NAME).then(function (ed) {
                editor = ed;
                editor.setSoftTabs(true);
                editor.setTabLength(2);
                buffer = editor.buffer;
            });
        });

        waitsForPromise(function () {
            var packages = atom.packages.getAvailablePackageNames();
            var languagePackage = undefined;

            if (packages.indexOf("language-r") > -1) {
                languagePackage = "language-r";
            } else if (packages.indexOf("language-python") > -1) {
                languagePackage = "language-python";
            } else if (packages.indexOf("MagicPython") > -1) {
                languagePackage = "MagicPython";
            }

            return atom.packages.activatePackage(languagePackage);
        });

        waitsForPromise(function () {
            return atom.packages.activatePackage("r-indent").then(function () {
                rIndent = new _libRIndent2["default"]();
            });
        });
    });

    describe("package", function () {
        return it("loads R file and package", function () {
            expect(editor.getPath()).toContain(FILE_NAME);
            expect(atom.packages.isPackageActive("r-indent")).toBe(true);
        });
    });

    // Aligned with opening delimiter
    describe("aligned with opening delimiter", function () {
        describe("when indenting after newline", function () {
            /*
            f <- function(param_a, param_b, param_c,
                             param_d):
                    pass
            */

            it("indents after open def params", function () {
                editor.insertText("f <- function(param_a, param_b, param_c,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(14));
            });

            /*
            x <- c(0, 1, 2,
                   3, 4, 5)
            */
            it("indents after open bracket with multiple values on the first line", function () {
                editor.insertText("x <- c(0, 1, 2,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(7));
            });

            /*
            x <- c(0,
                   1)
            */
            it("indents after open bracket with one value on the first line", function () {
                editor.insertText("x <- c(0,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(7));
            });

            /*
            x <- function(a, b, c, c(3, 4, 5,
                                     6, 7, 8)
                          )
            */
            it("indeents in nested lists when inner list is on the same line", function () {
                editor.insertText("x <- function(a, b, c, c(3, 4, 5,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(25));
            });

            it("indents back to opening delimiter after nested args", function () {
                editor.insertText("x <- function(a, b, c, c(3, 4, 5,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(25));

                editor.insertText("6, 7, 8)\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(14));
            });
            /*
            s = "[ will this \"break ( the parsing?"
            */
            it("does not indent with delimiters that are quoted", function () {
                editor.insertText("s = \"[ will this \\\"break ( the parsing?\"\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });
            /*
            x = ["here(\"(", "is", "a",
                     "list", "of", ["nested]",
                                    "strings\\"],
                     r"some \[\"[of which are raw",
                     "and some of which are not"]
            */
            it("knows when to indent when some delimiters are literal, and some are not", function () {
                editor.insertText("x = [\"here(\\\"(\", \"is\", \"a\",\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));

                editor.insertText("\"list\", \"of\", [\"nested]\",\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(20));

                editor.insertText("\"strings\\\\\"],\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(5));

                editor.insertText("r\"some \\[\\\"[of which are raw\",\n");
                editor.autoIndentSelectedRows(4);
                expect(buffer.lineForRow(4)).toBe(" ".repeat(5));
            });

            it("indents normally after function definition", function () {
                editor.insertText("f <- function(param_a, param_b, param_c){\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(2));
            });

            /*
            f <- function(param_a, param_b, param_c,
                     param_d){
                    pass
            */
            it("indents normally long args in function definition", function () {
                editor.insertText("f <- function(param_a, param_b, param_c,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(14));

                editor.insertText("param_d){\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(2));
            });

            /*
            f <- function(param_a,
                          param_b,
                          param_c){}
                    pass
            */
            it("keeps indentation on succeding open lines", function () {
                editor.insertText("def test(param_a,\n");
                rIndent.properlyIndent();
                editor.insertText("param_b,\n");
                editor.autoIndentSelectedRows(2);
                expect(buffer.lineForRow(2)).toBe(" ".repeat(9));
            });

            /*
            class TheClass(object):
                    def test(param_a, param_b,
                             param_c):
                        a_list = [1, 2, 3,
                                  4]
            */
            it("allows for fluid indent in multi-level situations", function () {
                editor.insertText("class TheClass(object):\n");
                editor.autoIndentSelectedRows(1);
                editor.insertText("def test(param_a, param_b,\n");
                rIndent.properlyIndent();
                editor.insertText("param_c):\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(8));

                editor.insertText("a_list = [1, 2, 3,\n");
                rIndent.properlyIndent();
                editor.insertText("4]\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(5)).toBe(" ".repeat(8));
            });

            /*
            def f(arg1, arg2, arg3,
                  arg4, arg5, arg6=")\)",
                  arg7=0):
                return 0
            */
            it("indents properly when delimiters are an argument default string", function () {
                editor.insertText("def f(arg1, arg2, arg3,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(6));

                editor.insertText("arg4, arg5, arg6=\")\\)\",\n");
                editor.autoIndentSelectedRows(2);
                expect(buffer.lineForRow(2)).toBe(" ".repeat(6));

                editor.insertText("arg7=0):\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(4));
            });

            /*
            for i in range(10):
                    for j in range(20):
                            def f(x=[0,1,2,
                                     3,4,5]):
                                return x * i * j
            */
            it("indents properly when blocks and lists are deeply nested", function () {
                editor.insertText("for i in range(10):\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));

                editor.insertText("for j in range(20):\n");
                editor.autoIndentSelectedRows(2);
                expect(buffer.lineForRow(2)).toBe(" ".repeat(8));

                editor.insertText("def f(x=[0,1,2,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(17));

                editor.insertText("3,4,5]):\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(4)).toBe(" ".repeat(12));
            });

            /*
            """ quote with a single string delimiter: " """
            var_name = [0, 1, 2,
            */
            it("handles odd number of string delimiters inside triple quoted string", function () {
                editor.insertText("\"\"\" quote with a single string delimiter: \" \"\"\"\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            """ here is a triple quote with a two string delimiters: "" """
            var_name = [0, 1, 2,
            */
            it("handles even number of string delimiters inside triple quoted string", function () {
                editor.insertText("\"\"\" a quote with a two string delimiters: \"\" \"\"\"\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            ### here is "a triple quote" with three extra" string delimiters" ###
            var_name = [0, 1, 2,
            */
            it("handles three string delimiters spaced out inside triple quoted string", function () {
                editor.insertText("### here is \"a quote\" with extra\" string delimiters\" ###\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            ### string with an \\"escaped delimiter in the middle###
            var_name = [0, 1, 2,;
            */
            it("correctly handles escaped delimieters at the end of a triple quoted string", function () {
                editor.insertText("### string with an \\\"escaped delimiter in the middle###\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            ### here is a string with an escaped delimiter ending\\###"
            var_name = [0, 1, 2,;
            */
            it("correctly handles escaped delimiters at the end of a quoted string", function () {
                editor.insertText("### here is a string with an escaped delimiter ending\\###\"\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });
        });

        describe("when unindenting after newline :: aligned with opening delimiter", function () {
            /*
            def test(param_a,
                     param_b):
                pass
            */
            it("unindents after close def params", function () {
                editor.insertText("def test(param_a,\n");
                rIndent.properlyIndent();
                editor.insertText("param_b):\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(4));
            });

            /*
            tup = (True, False,
                   False)
            */
            it("unindents after close tuple", function () {
                editor.insertText("tup = (True, False,\n");
                rIndent.properlyIndent();
                editor.insertText("False)\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe("");
            });

            /*
            a_list = [1, 2,
                      3]
            */
            it("unindents after close bracket", function () {
                editor.insertText("a_list = [1, 2,\n");
                rIndent.properlyIndent();
                editor.insertText("3]\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe("");
            });

            /*
            a_dict = {0: 0}
            */
            it("unindents after close curly brace", function () {
                editor.insertText("a_dict = {0: 0}\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });
        });
    });

    // Hanging
    describe("hanging", function () {
        describe("when indenting after newline", function () {
            /*
            def test(
                param_a
            )
            */
            it("hanging indents after open def params", function () {
                editor.insertText("def test(\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            tup = (
                "elem"
            )
            */
            it("indents after open tuple", function () {
                editor.insertText("tup = (\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            a_list = [
                "elem"
            ]
            */
            it("indents after open bracket", function () {
                editor.insertText("a_list = [\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            def test(
                param_a,
                param_b,
                param_c
            )
            */
            it("indents on succeding open lines", function () {
                editor.insertText("def test(\n");
                rIndent.properlyIndent();
                editor.insertText("param_a,\n");
                editor.autoIndentSelectedRows(2);
                editor.insertText("param_b,\n");
                editor.autoIndentSelectedRows(3);
                expect(buffer.lineForRow(3)).toBe(" ".repeat(4));
            });

            /*
            class TheClass(object):
                def test(
                        param_a, param_b,
                        param_c):
                            a_list = [
                                "1", "2", "3",
                                "4"
                            ]
            */
            it("allows for indent in multi-level situations", function () {
                editor.insertText("class TheClass(object):\n");
                editor.autoIndentSelectedRows(1);
                editor.insertText("def test(\n");
                rIndent.properlyIndent();
                editor.insertText("param_a, param_b,\n");
                editor.autoIndentSelectedRows(3);
                editor.insertText("param_c):\n");
                editor.autoIndentSelectedRows(4);
                expect(buffer.lineForRow(4)).toBe(" ".repeat(4));

                editor.insertText("a_list = [\n");
                rIndent.properlyIndent();
                editor.insertText("\"1\", \"2\", \"3\",\n");
                editor.autoIndentSelectedRows(6);
                editor.insertText("\"4\"]\n");
                editor.autoIndentSelectedRows(7);
                expect(buffer.lineForRow(7)).toBe(" ".repeat(4));
            });
        });

        describe("when newline is in a comment", function () {
            /*
            x = [    #
                0
            ]
            */
            it("indents when delimiter is not commented, but other characters are", function () {
                editor.insertText("x = [ #\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
             * [
             */
            it("does not indent when bracket delimiter is commented", function () {
                editor.insertText("# [\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
             * (
             */
            it("does not indent when parentheses delimiter is commented", function () {
                editor.insertText("# (\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
             * {
             */
            it("does not indent when brace delimiter is commented", function () {
                editor.insertText("# {\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
             * def f():
             */
            it("does not indent when function def is commented", function () {
                editor.insertText("# def f():\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });
        });

        describe("when continuing a hanging indent after opening/closing bracket(s)", function () {
            /*
            alpha = (
                epsilon(),
                gamma
            )
            */
            it("continues correctly after bracket is opened and closed on same line", function () {
                editor.insertText("alpha = (\n");
                rIndent.properlyIndent();
                editor.insertText("epsilon(),\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(4));
            });

            /*
            alpha = (
                    epsilon(arg1, arg2,
                            arg3, arg4),
                    gamma
            )
            */
            it("continues after bracket is opened/closed on different lines", function () {
                editor.insertText("alpha = (\n");
                rIndent.properlyIndent();

                editor.insertText("epsilon(arg1, arg2,\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));

                editor.insertText("arg3, arg4),\n");
                rIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(4));
            });
        });
    });

    describe("when source is malformed", function () {
        return(

            /*
            class DoesBadlyFormedCodeBreak )
            */
            it("does not throw error or indent when code is malformed", function () {
                editor.insertText("class DoesBadlyFormedCodeBreak )\n");
                expect(function () {
                    return rIndent.properlyIndent();
                }).not.toThrow();
                expect(buffer.lineForRow(1)).toBe("");
            })
        );
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vkc2FuZG9yZi8uYXRvbS9wYWNrYWdlcy9hdG9tLWxhbmd1YWdlLXIvaW5zdC9zcGVjL3ItaW5kZW50LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7MEJBQ29CLGlCQUFpQjs7OztBQURyQyxXQUFXLENBQUM7O0FBRVosUUFBUSxDQUFDLFVBQVUsRUFBRSxZQUFNO0FBQ3ZCLFFBQU0sU0FBUyxHQUFHLHNCQUFzQixDQUFDO0FBQ3pDLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQztBQUNsQixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbEIsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDOztBQUVuQixjQUFVLENBQUMsWUFBTTtBQUNiLHVCQUFlLENBQUM7bUJBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBRSxFQUFLO0FBQ3hDLHNCQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ1osc0JBQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsc0JBQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsc0JBQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO2FBQzFCLENBQUM7U0FBQSxDQUNMLENBQUM7O0FBRUYsdUJBQWUsQ0FBQyxZQUFNO0FBQ2xCLGdCQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLENBQUM7QUFDMUQsZ0JBQUksZUFBZSxZQUFBLENBQUM7O0FBRXBCLGdCQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDckMsK0JBQWUsR0FBRyxZQUFZLENBQUM7YUFDbEMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNqRCwrQkFBZSxHQUFHLGlCQUFpQixDQUFDO2FB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Q0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQztLQUNOLENBQUMsQ0FBQzs7QUFFSCxZQUFRLENBQUMsMEJBQTBCLEVBQUU7Ozs7OztBQUtqQyxjQUFFLENBQUMsdURBQXVELEVBQUUsWUFBTTtBQUM5RCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3hELHNCQUFNLENBQUM7MkJBQU0sT0FBTyxDQUFDLGNBQWMsRUFBRTtpQkFBQSxDQUFDLENBQ3JDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNmLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN6QyxDQUFDOztLQUFBLENBQ0wsQ0FBQztDQUNMLENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS9lZHNhbmRvcmYvLmF0b20vcGFja2FnZXMvYXRvbS1sYW5ndWFnZS1yL2luc3Qvc3BlYy9yLWluZGVudC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIjtcbmltcG9ydCBSSW5kZW50IGZyb20gXCIuLi9saWIvci1pbmRlbnRcIjtcbmRlc2NyaWJlKFwici1pbmRlbnRcIiwgKCkgPT4ge1xuICAgIGNvbnN0IEZJTEVfTkFNRSA9IFwiZml4dHVyZXMvdGVzdF9maWxlLlJcIjtcbiAgICBsZXQgYnVmZmVyID0gbnVsbDtcbiAgICBsZXQgZWRpdG9yID0gbnVsbDtcbiAgICBsZXQgckluZGVudCA9IG51bGw7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKEZJTEVfTkFNRSkudGhlbigoZWQpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IgPSBlZDtcbiAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0U29mdFRhYnModHJ1ZSk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLnNldFRhYkxlbmd0aCgyKTtcbiAgICAgICAgICAgICAgICBidWZmZXIgPSBlZGl0b3IuYnVmZmVyO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGFja2FnZXMgPSBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VOYW1lcygpO1xuICAgICAgICAgICAgbGV0IGxhbmd1YWdlUGFja2FnZTtcblxuICAgICAgICAgICAgaWYgKHBhY2thZ2VzLmluZGV4T2YoXCJsYW5ndWFnZS1yXCIpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBsYW5ndWFnZVBhY2thZ2UgPSBcImxhbmd1YWdlLXJcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFja2FnZXMuaW5kZXhPZihcImxhbmd1YWdlLXB5dGhvblwiKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgbGFuZ3VhZ2VQYWNrYWdlID0gXCJsYW5ndWFnZS1weXRob25cIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFja2FnZXMuaW5kZXhPZihcIk1hZ2ljUHl0aG9uXCIpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBsYW5ndWFnZVBhY2thZ2UgPSBcIk1hZ2ljUHl0aG9uXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShsYW5ndWFnZVBhY2thZ2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwici1pbmRlbnRcIikudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgckluZGVudCA9IG5ldyBSSW5kZW50KCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoXCJwYWNrYWdlXCIsICgpID0+XG4gICAgICAgIGl0KFwibG9hZHMgUiBmaWxlIGFuZCBwYWNrYWdlXCIsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0UGF0aCgpKS50b0NvbnRhaW4oRklMRV9OQU1FKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZShcInItaW5kZW50XCIpKS50b0JlKHRydWUpO1xuICAgICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBBbGlnbmVkIHdpdGggb3BlbmluZyBkZWxpbWl0ZXJcbiAgICBkZXNjcmliZShcImFsaWduZWQgd2l0aCBvcGVuaW5nIGRlbGltaXRlclwiLCAoKSA9PiB7XG4gICAgICAgIGRlc2NyaWJlKFwid2hlbiBpbmRlbnRpbmcgYWZ0ZXIgbmV3bGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZiA8LSBmdW5jdGlvbihwYXJhbV9hLCBwYXJhbV9iLCBwYXJhbV9jLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbV9kKTpcbiAgICAgICAgICAgICAgICAgICAgcGFzc1xuICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIGFmdGVyIG9wZW4gZGVmIHBhcmFtc1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJmIDwtIGZ1bmN0aW9uKHBhcmFtX2EsIHBhcmFtX2IsIHBhcmFtX2MsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDE0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHggPC0gYygwLCAxLCAyLFxuICAgICAgICAgICAgICAgICAgIDMsIDQsIDUpXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIGFmdGVyIG9wZW4gYnJhY2tldCB3aXRoIG11bHRpcGxlIHZhbHVlcyBvbiB0aGUgZmlyc3QgbGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ4IDwtIGMoMCwgMSwgMixcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNykpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB4IDwtIGMoMCxcbiAgICAgICAgICAgICAgICAgICAxKVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBhZnRlciBvcGVuIGJyYWNrZXQgd2l0aCBvbmUgdmFsdWUgb24gdGhlIGZpcnN0IGxpbmVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwieCA8LSBjKDAsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA8LSBmdW5jdGlvbihhLCBiLCBjLCBjKDMsIDQsIDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgNiwgNywgOClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZWVudHMgaW4gbmVzdGVkIGxpc3RzIHdoZW4gaW5uZXIgbGlzdCBpcyBvbiB0aGUgc2FtZSBsaW5lXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPC0gZnVuY3Rpb24oYSwgYiwgYywgYygzLCA0LCA1LFxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCgyNSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBiYWNrIHRvIG9wZW5pbmcgZGVsaW1pdGVyIGFmdGVyIG5lc3RlZCBhcmdzXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPC0gZnVuY3Rpb24oYSwgYiwgYywgYygzLCA0LCA1LFxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCgyNSkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCI2LCA3LCA4KVxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCgxNCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgcyA9IFwiWyB3aWxsIHRoaXMgXFxcImJyZWFrICggdGhlIHBhcnNpbmc/XCJcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImRvZXMgbm90IGluZGVudCB3aXRoIGRlbGltaXRlcnMgdGhhdCBhcmUgcXVvdGVkXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInMgPSBcXFwiWyB3aWxsIHRoaXMgXFxcXFxcXCJicmVhayAoIHRoZSBwYXJzaW5nP1xcXCJcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIlwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHggPSBbXCJoZXJlKFxcXCIoXCIsIFwiaXNcIiwgXCJhXCIsXG4gICAgICAgICAgICAgICAgICAgICBcImxpc3RcIiwgXCJvZlwiLCBbXCJuZXN0ZWRdXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0cmluZ3NcXFxcXCJdLFxuICAgICAgICAgICAgICAgICAgICAgclwic29tZSBcXFtcXFwiW29mIHdoaWNoIGFyZSByYXdcIixcbiAgICAgICAgICAgICAgICAgICAgIFwiYW5kIHNvbWUgb2Ygd2hpY2ggYXJlIG5vdFwiXVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwia25vd3Mgd2hlbiB0byBpbmRlbnQgd2hlbiBzb21lIGRlbGltaXRlcnMgYXJlIGxpdGVyYWwsIGFuZCBzb21lIGFyZSBub3RcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwieCA9IFtcXFwiaGVyZShcXFxcXFxcIihcXFwiLCBcXFwiaXNcXFwiLCBcXFwiYVxcXCIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiXFxcImxpc3RcXFwiLCBcXFwib2ZcXFwiLCBbXFxcIm5lc3RlZF1cXFwiLFxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCgyMCkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJcXFwic3RyaW5nc1xcXFxcXFxcXFxcIl0sXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMykpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiclxcXCJzb21lIFxcXFxbXFxcXFxcXCJbb2Ygd2hpY2ggYXJlIHJhd1xcXCIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdyg0KSkudG9CZShcIiBcIi5yZXBlYXQoNSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBub3JtYWxseSBhZnRlciBmdW5jdGlvbiBkZWZpbml0aW9uXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImYgPC0gZnVuY3Rpb24ocGFyYW1fYSwgcGFyYW1fYiwgcGFyYW1fYyl7XFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDIpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZiA8LSBmdW5jdGlvbihwYXJhbV9hLCBwYXJhbV9iLCBwYXJhbV9jLFxuICAgICAgICAgICAgICAgICAgICAgcGFyYW1fZCl7XG4gICAgICAgICAgICAgICAgICAgIHBhc3NcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgbm9ybWFsbHkgbG9uZyBhcmdzIGluIGZ1bmN0aW9uIGRlZmluaXRpb25cIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZiA8LSBmdW5jdGlvbihwYXJhbV9hLCBwYXJhbV9iLCBwYXJhbV9jLFxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCgxNCkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJwYXJhbV9kKXtcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoMikpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBmIDwtIGZ1bmN0aW9uKHBhcmFtX2EsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtX2IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtX2Mpe31cbiAgICAgICAgICAgICAgICAgICAgcGFzc1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwia2VlcHMgaW5kZW50YXRpb24gb24gc3VjY2VkaW5nIG9wZW4gbGluZXNcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGVmIHRlc3QocGFyYW1fYSxcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicGFyYW1fYixcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoMik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCg5KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGNsYXNzIFRoZUNsYXNzKG9iamVjdCk6XG4gICAgICAgICAgICAgICAgICAgIGRlZiB0ZXN0KHBhcmFtX2EsIHBhcmFtX2IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtX2MpOlxuICAgICAgICAgICAgICAgICAgICAgICAgYV9saXN0ID0gWzEsIDIsIDMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgNF1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImFsbG93cyBmb3IgZmx1aWQgaW5kZW50IGluIG11bHRpLWxldmVsIHNpdHVhdGlvbnNcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiY2xhc3MgVGhlQ2xhc3Mob2JqZWN0KTpcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoMSk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJkZWYgdGVzdChwYXJhbV9hLCBwYXJhbV9iLFxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJwYXJhbV9jKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygzKSkudG9CZShcIiBcIi5yZXBlYXQoOCkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhX2xpc3QgPSBbMSwgMiwgMyxcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiNF1cXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdyg1KSkudG9CZShcIiBcIi5yZXBlYXQoOCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBkZWYgZihhcmcxLCBhcmcyLCBhcmczLFxuICAgICAgICAgICAgICAgICAgYXJnNCwgYXJnNSwgYXJnNj1cIilcXClcIixcbiAgICAgICAgICAgICAgICAgIGFyZzc9MCk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgcHJvcGVybHkgd2hlbiBkZWxpbWl0ZXJzIGFyZSBhbiBhcmd1bWVudCBkZWZhdWx0IHN0cmluZ1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJkZWYgZihhcmcxLCBhcmcyLCBhcmczLFxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCg2KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFyZzQsIGFyZzUsIGFyZzY9XFxcIilcXFxcKVxcXCIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDIpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoNikpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhcmc3PTApOlxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDMpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGZvciBpIGluIHJhbmdlKDEwKTpcbiAgICAgICAgICAgICAgICAgICAgZm9yIGogaW4gcmFuZ2UoMjApOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZiBmKHg9WzAsMSwyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDMsNCw1XSk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB4ICogaSAqIGpcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgcHJvcGVybHkgd2hlbiBibG9ja3MgYW5kIGxpc3RzIGFyZSBkZWVwbHkgbmVzdGVkXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImZvciBpIGluIHJhbmdlKDEwKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJmb3IgaiBpbiByYW5nZSgyMCk6XFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDIpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoOCkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJkZWYgZih4PVswLDEsMixcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygzKSkudG9CZShcIiBcIi5yZXBlYXQoMTcpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiMyw0LDVdKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdyg0KSkudG9CZShcIiBcIi5yZXBlYXQoMTIpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgXCJcIlwiIHF1b3RlIHdpdGggYSBzaW5nbGUgc3RyaW5nIGRlbGltaXRlcjogXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXJfbmFtZSA9IFswLCAxLCAyLFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaGFuZGxlcyBvZGQgbnVtYmVyIG9mIHN0cmluZyBkZWxpbWl0ZXJzIGluc2lkZSB0cmlwbGUgcXVvdGVkIHN0cmluZ1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJcXFwiXFxcIlxcXCIgcXVvdGUgd2l0aCBhIHNpbmdsZSBzdHJpbmcgZGVsaW1pdGVyOiBcXFwiIFxcXCJcXFwiXFxcIlxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInZhcl9uYW1lID0gWzAsIDEsIDIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDEyKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIFwiXCJcIiBoZXJlIGlzIGEgdHJpcGxlIHF1b3RlIHdpdGggYSB0d28gc3RyaW5nIGRlbGltaXRlcnM6IFwiXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXJfbmFtZSA9IFswLCAxLCAyLFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaGFuZGxlcyBldmVuIG51bWJlciBvZiBzdHJpbmcgZGVsaW1pdGVycyBpbnNpZGUgdHJpcGxlIHF1b3RlZCBzdHJpbmdcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiXFxcIlxcXCJcXFwiIGEgcXVvdGUgd2l0aCBhIHR3byBzdHJpbmcgZGVsaW1pdGVyczogXFxcIlxcXCIgXFxcIlxcXCJcXFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwidmFyX25hbWUgPSBbMCwgMSwgMixcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoMTIpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgIyMjIGhlcmUgaXMgXCJhIHRyaXBsZSBxdW90ZVwiIHdpdGggdGhyZWUgZXh0cmFcIiBzdHJpbmcgZGVsaW1pdGVyc1wiICMjI1xuICAgICAgICAgICAgdmFyX25hbWUgPSBbMCwgMSwgMixcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImhhbmRsZXMgdGhyZWUgc3RyaW5nIGRlbGltaXRlcnMgc3BhY2VkIG91dCBpbnNpZGUgdHJpcGxlIHF1b3RlZCBzdHJpbmdcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiIyMjIGhlcmUgaXMgXFxcImEgcXVvdGVcXFwiIHdpdGggZXh0cmFcXFwiIHN0cmluZyBkZWxpbWl0ZXJzXFxcIiAjIyNcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ2YXJfbmFtZSA9IFswLCAxLCAyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCgxMikpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAjIyMgc3RyaW5nIHdpdGggYW4gXFxcXFwiZXNjYXBlZCBkZWxpbWl0ZXIgaW4gdGhlIG1pZGRsZSMjI1xuICAgICAgICAgICAgdmFyX25hbWUgPSBbMCwgMSwgMiw7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJjb3JyZWN0bHkgaGFuZGxlcyBlc2NhcGVkIGRlbGltaWV0ZXJzIGF0IHRoZSBlbmQgb2YgYSB0cmlwbGUgcXVvdGVkIHN0cmluZ1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIjIyMgc3RyaW5nIHdpdGggYW4gXFxcXFxcXCJlc2NhcGVkIGRlbGltaXRlciBpbiB0aGUgbWlkZGxlIyMjXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwidmFyX25hbWUgPSBbMCwgMSwgMixcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoMTIpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgIyMjIGhlcmUgaXMgYSBzdHJpbmcgd2l0aCBhbiBlc2NhcGVkIGRlbGltaXRlciBlbmRpbmdcXFxcIyMjXCJcbiAgICAgICAgICAgIHZhcl9uYW1lID0gWzAsIDEsIDIsO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiY29ycmVjdGx5IGhhbmRsZXMgZXNjYXBlZCBkZWxpbWl0ZXJzIGF0IHRoZSBlbmQgb2YgYSBxdW90ZWQgc3RyaW5nXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiMjIyBoZXJlIGlzIGEgc3RyaW5nIHdpdGggYW4gZXNjYXBlZCBkZWxpbWl0ZXIgZW5kaW5nXFxcXCMjI1xcXCJcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ2YXJfbmFtZSA9IFswLCAxLCAyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCgxMikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlc2NyaWJlKFwid2hlbiB1bmluZGVudGluZyBhZnRlciBuZXdsaW5lIDo6IGFsaWduZWQgd2l0aCBvcGVuaW5nIGRlbGltaXRlclwiLCAoKSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZGVmIHRlc3QocGFyYW1fYSxcbiAgICAgICAgICAgICAgICAgICAgIHBhcmFtX2IpOlxuICAgICAgICAgICAgICAgIHBhc3NcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcInVuaW5kZW50cyBhZnRlciBjbG9zZSBkZWYgcGFyYW1zXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiB0ZXN0KHBhcmFtX2EsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInBhcmFtX2IpOlxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHR1cCA9IChUcnVlLCBGYWxzZSxcbiAgICAgICAgICAgICAgICAgICBGYWxzZSlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcInVuaW5kZW50cyBhZnRlciBjbG9zZSB0dXBsZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ0dXAgPSAoVHJ1ZSwgRmFsc2UsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIkZhbHNlKVxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiXCIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBhX2xpc3QgPSBbMSwgMixcbiAgICAgICAgICAgICAgICAgICAgICAzXVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwidW5pbmRlbnRzIGFmdGVyIGNsb3NlIGJyYWNrZXRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYV9saXN0ID0gWzEsIDIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIjNdXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCJcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGFfZGljdCA9IHswOiAwfVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwidW5pbmRlbnRzIGFmdGVyIGNsb3NlIGN1cmx5IGJyYWNlXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFfZGljdCA9IHswOiAwfVxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gSGFuZ2luZ1xuICAgIGRlc2NyaWJlKFwiaGFuZ2luZ1wiLCAoKSA9PiB7XG4gICAgICAgIGRlc2NyaWJlKFwid2hlbiBpbmRlbnRpbmcgYWZ0ZXIgbmV3bGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZGVmIHRlc3QoXG4gICAgICAgICAgICAgICAgcGFyYW1fYVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaGFuZ2luZyBpbmRlbnRzIGFmdGVyIG9wZW4gZGVmIHBhcmFtc1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJkZWYgdGVzdChcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB0dXAgPSAoXG4gICAgICAgICAgICAgICAgXCJlbGVtXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgYWZ0ZXIgb3BlbiB0dXBsZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ0dXAgPSAoXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgYV9saXN0ID0gW1xuICAgICAgICAgICAgICAgIFwiZWxlbVwiXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIGFmdGVyIG9wZW4gYnJhY2tldFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhX2xpc3QgPSBbXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZGVmIHRlc3QoXG4gICAgICAgICAgICAgICAgcGFyYW1fYSxcbiAgICAgICAgICAgICAgICBwYXJhbV9iLFxuICAgICAgICAgICAgICAgIHBhcmFtX2NcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgb24gc3VjY2VkaW5nIG9wZW4gbGluZXNcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGVmIHRlc3QoXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInBhcmFtX2EsXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicGFyYW1fYixcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoMyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDMpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGNsYXNzIFRoZUNsYXNzKG9iamVjdCk6XG4gICAgICAgICAgICAgICAgZGVmIHRlc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbV9hLCBwYXJhbV9iLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1fYyk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYV9saXN0ID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjFcIiwgXCIyXCIsIFwiM1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImFsbG93cyBmb3IgaW5kZW50IGluIG11bHRpLWxldmVsIHNpdHVhdGlvbnNcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiY2xhc3MgVGhlQ2xhc3Mob2JqZWN0KTpcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoMSk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJkZWYgdGVzdChcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicGFyYW1fYSwgcGFyYW1fYixcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoMyk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJwYXJhbV9jKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoNCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDQpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFfbGlzdCA9IFtcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiXFxcIjFcXFwiLCBcXFwiMlxcXCIsIFxcXCIzXFxcIixcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoNik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJcXFwiNFxcXCJdXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDcpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdyg3KSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlc2NyaWJlKFwid2hlbiBuZXdsaW5lIGlzIGluIGEgY29tbWVudFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9IFsgICAgI1xuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgd2hlbiBkZWxpbWl0ZXIgaXMgbm90IGNvbW1lbnRlZCwgYnV0IG90aGVyIGNoYXJhY3RlcnMgYXJlXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPSBbICNcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBbXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiZG9lcyBub3QgaW5kZW50IHdoZW4gYnJhY2tldCBkZWxpbWl0ZXIgaXMgY29tbWVudGVkXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiMgW1xcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiXCIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiAoXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiZG9lcyBub3QgaW5kZW50IHdoZW4gcGFyZW50aGVzZXMgZGVsaW1pdGVyIGlzIGNvbW1lbnRlZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIjIChcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIlwiKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICoge1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImRvZXMgbm90IGluZGVudCB3aGVuIGJyYWNlIGRlbGltaXRlciBpcyBjb21tZW50ZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiIyB7XFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCJcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIGRlZiBmKCk6XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiZG9lcyBub3QgaW5kZW50IHdoZW4gZnVuY3Rpb24gZGVmIGlzIGNvbW1lbnRlZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIjIGRlZiBmKCk6XFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCJcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVzY3JpYmUoXCJ3aGVuIGNvbnRpbnVpbmcgYSBoYW5naW5nIGluZGVudCBhZnRlciBvcGVuaW5nL2Nsb3NpbmcgYnJhY2tldChzKVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgYWxwaGEgPSAoXG4gICAgICAgICAgICAgICAgZXBzaWxvbigpLFxuICAgICAgICAgICAgICAgIGdhbW1hXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJjb250aW51ZXMgY29ycmVjdGx5IGFmdGVyIGJyYWNrZXQgaXMgb3BlbmVkIGFuZCBjbG9zZWQgb24gc2FtZSBsaW5lXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFscGhhID0gKFxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJlcHNpbG9uKCksXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgYWxwaGEgPSAoXG4gICAgICAgICAgICAgICAgICAgIGVwc2lsb24oYXJnMSwgYXJnMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmczLCBhcmc0KSxcbiAgICAgICAgICAgICAgICAgICAgZ2FtbWFcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImNvbnRpbnVlcyBhZnRlciBicmFja2V0IGlzIG9wZW5lZC9jbG9zZWQgb24gZGlmZmVyZW50IGxpbmVzXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFscGhhID0gKFxcblwiKTtcbiAgICAgICAgICAgICAgICBySW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImVwc2lsb24oYXJnMSwgYXJnMixcXG5cIik7XG4gICAgICAgICAgICAgICAgckluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoMTIpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYXJnMywgYXJnNCksXFxuXCIpO1xuICAgICAgICAgICAgICAgIHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMykpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKFwid2hlbiBzb3VyY2UgaXMgbWFsZm9ybWVkXCIsICgpID0+XG5cbiAgICAgICAgLypcbiAgICAgICAgY2xhc3MgRG9lc0JhZGx5Rm9ybWVkQ29kZUJyZWFrIClcbiAgICAgICAgKi9cbiAgICAgICAgaXQoXCJkb2VzIG5vdCB0aHJvdyBlcnJvciBvciBpbmRlbnQgd2hlbiBjb2RlIGlzIG1hbGZvcm1lZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImNsYXNzIERvZXNCYWRseUZvcm1lZENvZGVCcmVhayApXFxuXCIpO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHJJbmRlbnQucHJvcGVybHlJbmRlbnQoKSlcbiAgICAgICAgICAgIC5ub3QudG9UaHJvdygpO1xuICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiXCIpO1xuICAgICAgICB9KVxuICAgICk7XG59KTsiXX0=