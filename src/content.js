/* ============================================================================
 * PseudoLab content: Learn lessons + Practice questions.
 * Cambridge International AS & A Level Computer Science (9618).
 *
 * Lesson topics follow the coursebook (Langfield & Duddell):
 *   AS  -> Part 2: Ch 12 Algorithm design, Ch 13 Data types & structures,
 *          Ch 14 Programming and data representation.
 *   A2  -> Part 4: Ch 23 Algorithms, Ch 24 Recursion,
 *          Ch 26 File processing & exception handling, Ch 27 OOP, Ch 25 paradigms.
 *
 * Practice questions are auto-graded by running BOTH the model solution and the
 * learner's code on the same inputs and comparing OUTPUT.
 * ==========================================================================*/
(function (global) {
  'use strict';

  var lessons = [
    /* ============================ AS LEVEL ============================ */
    {
      id: 'as-ct', level: 'AS', topic: 'Ch 12 · Algorithm Design',
      title: 'Computational Thinking & Algorithms',
      html:
        '<p>Computational thinking is a logical approach to solving problems. It rests on four ideas you should be able to name and explain:</p>' +
        '<ul><li><strong>Abstraction</strong> — remove detail that is not needed (a map of train lines, not streets).</li>' +
        '<li><strong>Decomposition</strong> — break a problem into smaller sub-problems, which become modules (procedures/functions).</li>' +
        '<li><strong>Pattern recognition</strong> — reuse standard solutions (searching, sorting, totalling).</li>' +
        '<li><strong>Algorithmic thinking</strong> — design clear step-by-step instructions.</li></ul>' +
        '<p>An <strong>algorithm</strong> is a sequence of defined steps that performs a task. Algorithms can be expressed as <em>structured English</em>, a <em>flowchart</em>, or <em>pseudocode</em>. This course (and the exam) uses pseudocode.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> A good algorithm is correct, finite (it ends), unambiguous, and works for every valid input — including edge cases.</div>',
      example:
        '// Algorithm: report the largest of three numbers\nDECLARE a : INTEGER\nDECLARE b : INTEGER\nDECLARE c : INTEGER\na <- 14\nb <- 9\nc <- 21\nIF a >= b AND a >= c THEN\n   OUTPUT "Largest is ", a\nELSE\n   IF b >= c THEN\n      OUTPUT "Largest is ", b\n   ELSE\n      OUTPUT "Largest is ", c\n   ENDIF\nENDIF'
    },
    {
      id: 'as-vars', level: 'AS', topic: 'Ch 12 · Algorithm Design',
      title: 'Variables, Constants & Data Types',
      html:
        '<p>A <strong>variable</strong> is a named, typed store whose value can change. A <strong>constant</strong> holds a fixed value. Always declare variables explicitly.</p>' +
        '<p>The data types in 9618 pseudocode are:</p>' +
        '<ul><li><code>INTEGER</code> — whole number, e.g. 5, -3</li>' +
        '<li><code>REAL</code> — has a fractional part, written with a decimal point, e.g. 4.7, -4.0</li>' +
        '<li><code>CHAR</code> — one character in single quotes, e.g. <code>\'A\'</code></li>' +
        '<li><code>STRING</code> — characters in double quotes, e.g. <code>"Hello"</code></li>' +
        '<li><code>BOOLEAN</code> — <code>TRUE</code> or <code>FALSE</code></li>' +
        '<li><code>DATE</code> — a calendar date, dd/mm/yyyy</li></ul>' +
        '<pre class="syntax">DECLARE &lt;identifier&gt; : &lt;data type&gt;\nCONSTANT &lt;identifier&gt; = &lt;literal value&gt;</pre>' +
        '<div class="tip"><strong>Exam tip:</strong> Identifiers use mixed case (<code>NumberOfPlayers</code>); keywords are UPPER CASE. Only a literal may be used as a constant value — never a variable or expression.</div>',
      example:
        'CONSTANT VAT = 0.20\nDECLARE Price : REAL\nDECLARE GameOver : BOOLEAN\nDECLARE Grade : CHAR\nPrice <- 50\nGrade <- \'A\'\nGameOver <- FALSE\nOUTPUT "Price inc VAT: ", Price * (1 + VAT)\nOUTPUT "Grade: ", Grade, "  Over? ", GameOver'
    },
    {
      id: 'as-assign', level: 'AS', topic: 'Ch 12 · Algorithm Design',
      title: 'Assignment & Arithmetic',
      html:
        '<p>The assignment operator is <code>&larr;</code> (type <code>&lt;-</code> in this editor). The right-hand side is evaluated, then stored in the variable on the left.</p>' +
        '<p>Arithmetic operators: <code>+ &nbsp; - &nbsp; * &nbsp; /</code> and the integer operators <code>DIV</code> and <code>MOD</code>.</p>' +
        '<ul><li><code>/</code> always gives a <strong>REAL</strong> result (so <code>10 / 2</code> is 5.0).</li>' +
        '<li><code>DIV</code> is whole-number division: <code>17 DIV 5</code> = 3.</li>' +
        '<li><code>MOD</code> is the remainder: <code>17 MOD 5</code> = 2.</li></ul>' +
        '<div class="tip"><strong>Exam tip:</strong> <code>* /</code> bind tighter than <code>+ -</code>. Use brackets to make complex expressions clear. To test even numbers use <code>n MOD 2 = 0</code>.</div>',
      example:
        'DECLARE Seconds : INTEGER\nDECLARE Mins : INTEGER\nDECLARE Secs : INTEGER\nSeconds <- 200\nMins <- Seconds DIV 60\nSecs <- Seconds MOD 60\nOUTPUT Seconds, " seconds = ", Mins, " min ", Secs, " sec"'
    },
    {
      id: 'as-bool', level: 'AS', topic: 'Ch 14 · Programming',
      title: 'Boolean Expressions & Logic',
      html:
        '<p>A condition is a <strong>Boolean expression</strong> — it evaluates to <code>TRUE</code> or <code>FALSE</code>.</p>' +
        '<p>Relational operators: <code>=</code>, <code>&lt;&gt;</code> (not equal), <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>.</p>' +
        '<p>Logic operators combine Booleans: <code>AND</code> (both), <code>OR</code> (either), <code>NOT</code> (negate).</p>' +
        '<div class="tip"><strong>Exam tip:</strong> Bracket each comparison when combining them: <code>(age &gt;= 13) AND (age &lt;= 19)</code>. This avoids precedence mistakes and is clearer to the examiner.</div>',
      example:
        'DECLARE Age : INTEGER\nDECLARE HasTicket : BOOLEAN\nAge <- 15\nHasTicket <- TRUE\nIF (Age >= 13 AND Age <= 17) AND HasTicket THEN\n   OUTPUT "Teen ticket valid"\nENDIF\nOUTPUT "Not an adult? ", NOT (Age >= 18)'
    },
    {
      id: 'as-select', level: 'AS', topic: 'Ch 14 · Programming',
      title: 'Selection: IF and CASE',
      html:
        '<p><code>IF</code> chooses between paths. Use <code>CASE OF</code> when one variable is tested against several discrete values.</p>' +
        '<pre class="syntax">IF &lt;condition&gt; THEN\n   &lt;statements&gt;\nELSE\n   &lt;statements&gt;\nENDIF\n\nCASE OF &lt;variable&gt;\n   &lt;value1&gt; : &lt;statement(s)&gt;\n   &lt;value2&gt; TO &lt;value3&gt; : &lt;statement(s)&gt;\n   OTHERWISE : &lt;statement(s)&gt;\nENDCASE</pre>' +
        '<div class="tip"><strong>Exam tip:</strong> CASE clauses are tested in order; the first match runs and the rest are skipped. A value can be a range (<code>1 TO 49</code>). Put <code>OTHERWISE</code> last.</div>',
      example:
        'DECLARE Mark : INTEGER\nMark <- 72\nCASE OF Mark\n   80 TO 100 : OUTPUT "A"\n   70 TO 79  : OUTPUT "B"\n   60 TO 69  : OUTPUT "C"\n   OTHERWISE : OUTPUT "Below C"\nENDCASE'
    },
    {
      id: 'as-iter', level: 'AS', topic: 'Ch 12 / 14 · Iteration',
      title: 'Iteration: FOR, WHILE, REPEAT',
      html:
        '<p>Three loop constructs — know exactly when each is appropriate:</p>' +
        '<ul><li><strong>Count-controlled</strong> <code>FOR … NEXT</code> — when the number of repetitions is known. <code>STEP</code> may be negative.</li>' +
        '<li><strong>Pre-condition</strong> <code>WHILE … ENDWHILE</code> — test <em>before</em>; may run zero times.</li>' +
        '<li><strong>Post-condition</strong> <code>REPEAT … UNTIL</code> — test <em>after</em>; always runs at least once.</li></ul>' +
        '<pre class="syntax">FOR i &lt;- 1 TO 10 STEP 1\n   &lt;statements&gt;\nNEXT i\n\nWHILE &lt;condition&gt;\n   &lt;statements&gt;\nENDWHILE\n\nREPEAT\n   &lt;statements&gt;\nUNTIL &lt;condition&gt;</pre>' +
        '<div class="tip"><strong>Exam tip:</strong> Use <code>REPEAT</code> for input validation — you must ask at least once. Use a <code>WHILE</code> loop when the loop might not run at all.</div>',
      example:
        'DECLARE Total : INTEGER\nDECLARE i : INTEGER\nTotal <- 0\nFOR i <- 1 TO 10\n   Total <- Total + i\nNEXT i\nOUTPUT "Sum 1..10 = ", Total\n\nDECLARE n : INTEGER\nn <- 100\nWHILE n > 1\n   n <- n DIV 2\nENDWHILE\nOUTPUT "Halved down to ", n'
    },
    {
      id: 'as-stdalg', level: 'AS', topic: 'Ch 12 · Standard Methods',
      title: 'Standard Algorithms & Trace Tables',
      html:
        '<p>Examiners expect fluency with these reusable patterns:</p>' +
        '<ul><li><strong>Totalling</strong> — keep a running <code>Total</code>.</li>' +
        '<li><strong>Counting</strong> — increment a <code>Count</code> when a condition is met.</li>' +
        '<li><strong>Maximum / minimum</strong> — assume the first value, then compare the rest.</li>' +
        '<li><strong>Average</strong> — total &divide; count.</li>' +
        '<li><strong>Rogue value (sentinel)</strong> — a special value that ends input, e.g. <code>-1</code>.</li></ul>' +
        '<p>A <strong>trace table</strong> records the value of each variable after every step — the key technique for dry-running and debugging an algorithm by hand.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> The sentinel itself must <em>not</em> be processed — test for it before using the value.</div>',
      example:
        '// Total and count values until the rogue value -1 is reached\nDECLARE Data : ARRAY[1:6] OF INTEGER\nDECLARE Total : INTEGER\nDECLARE Count : INTEGER\nDECLARE i : INTEGER\nData[1] <- 7\nData[2] <- 3\nData[3] <- 10\nData[4] <- 5\nData[5] <- -1     // rogue value marks the end\nTotal <- 0\nCount <- 0\ni <- 1\nWHILE Data[i] <> -1\n   Total <- Total + Data[i]\n   Count <- Count + 1\n   i <- i + 1\nENDWHILE\nOUTPUT "Count = ", Count\nOUTPUT "Total = ", Total\nOUTPUT "Average = ", Total / Count'
    },
    {
      id: 'as-1d', level: 'AS', topic: 'Ch 13 · Data Structures',
      title: 'One-Dimensional Arrays',
      html:
        '<p>An array is a fixed-length collection of elements of the <em>same</em> type, reached by an index.</p>' +
        '<pre class="syntax">DECLARE &lt;identifier&gt; : ARRAY[&lt;lower&gt;:&lt;upper&gt;] OF &lt;type&gt;</pre>' +
        '<p>Cambridge arrays normally start at index <strong>1</strong>. Pair every array with a <code>FOR</code> loop to read, search, total or print all its elements.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> State the bounds explicitly. <code>ARRAY[1:30]</code> has 30 elements indexed 1 to 30.</div>',
      example:
        'DECLARE Scores : ARRAY[1:5] OF INTEGER\nDECLARE i : INTEGER\nDECLARE Total : INTEGER\nScores[1] <- 8\nScores[2] <- 5\nScores[3] <- 9\nScores[4] <- 4\nScores[5] <- 7\nTotal <- 0\nFOR i <- 1 TO 5\n   Total <- Total + Scores[i]\nNEXT i\nOUTPUT "Average score = ", Total / 5'
    },
    {
      id: 'as-2d', level: 'AS', topic: 'Ch 13 · Data Structures',
      title: 'Two-Dimensional Arrays',
      html:
        '<p>A 2-D array models a table or grid. The first index is usually the <em>row</em>, the second the <em>column</em>.</p>' +
        '<pre class="syntax">DECLARE &lt;identifier&gt; : ARRAY[&lt;l1&gt;:&lt;u1&gt;, &lt;l2&gt;:&lt;u2&gt;] OF &lt;type&gt;</pre>' +
        '<p>Process a 2-D array with <strong>nested</strong> <code>FOR</code> loops — the outer loop for rows, the inner for columns.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> Keep your index order consistent: <code>Grid[Row, Col]</code> everywhere.</div>',
      example:
        'DECLARE Grid : ARRAY[1:2, 1:3] OF INTEGER\nDECLARE r : INTEGER\nDECLARE c : INTEGER\nDECLARE v : INTEGER\nv <- 1\nFOR r <- 1 TO 2\n   FOR c <- 1 TO 3\n      Grid[r, c] <- v\n      v <- v + 1\n   NEXT c\nNEXT r\nFOR r <- 1 TO 2\n   OUTPUT Grid[r,1], " ", Grid[r,2], " ", Grid[r,3]\nNEXT r'
    },
    {
      id: 'as-searchsort', level: 'AS', topic: 'Ch 13 · Searching & Sorting',
      title: 'Linear Search & Bubble Sort',
      html:
        '<p>Two standard algorithms you must be able to write and trace.</p>' +
        '<p><strong>Linear search:</strong> examine each element in turn until the target is found or the array ends. Use a BOOLEAN flag to record success.</p>' +
        '<p><strong>Bubble sort:</strong> repeatedly compare adjacent pairs and swap them if out of order; the largest value "bubbles" to the end each pass.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> An efficient bubble sort stops early if a complete pass makes no swaps (the data is already sorted).</div>',
      example:
        'DECLARE A : ARRAY[1:6] OF INTEGER\nDECLARE i : INTEGER\nDECLARE j : INTEGER\nDECLARE temp : INTEGER\nA[1]<-5\nA[2]<-1\nA[3]<-4\nA[4]<-2\nA[5]<-8\nA[6]<-3\nFOR i <- 1 TO 5\n   FOR j <- 1 TO 6 - i\n      IF A[j] > A[j+1] THEN\n         temp <- A[j]\n         A[j] <- A[j+1]\n         A[j+1] <- temp\n      ENDIF\n   NEXT j\nNEXT i\nFOR i <- 1 TO 6\n   OUTPUT A[i]\nNEXT i'
    },
    {
      id: 'as-records', level: 'AS', topic: 'Ch 13 · Data Structures',
      title: 'The Record Type',
      html:
        '<p>A <strong>record</strong> groups related fields of (possibly) different types under one type name. Define it with <code>TYPE … ENDTYPE</code>, then declare variables of that type and use dot notation.</p>' +
        '<pre class="syntax">TYPE &lt;TypeName&gt;\n   DECLARE &lt;field&gt; : &lt;type&gt;\n   DECLARE &lt;field&gt; : &lt;type&gt;\nENDTYPE</pre>' +
        '<div class="tip"><strong>Exam tip:</strong> Records and arrays combine powerfully: <code>ARRAY[1:30] OF StudentRecord</code> models a whole form. Access it as <code>Form[i].Name</code>.</div>',
      example:
        'TYPE StudentRecord\n   DECLARE Name : STRING\n   DECLARE YearGroup : INTEGER\nENDTYPE\n\nDECLARE Form : ARRAY[1:3] OF StudentRecord\nForm[1].Name <- "Ada"\nForm[1].YearGroup <- 12\nForm[2].Name <- "Bo"\nForm[2].YearGroup <- 13\nForm[3].Name <- "Cara"\nForm[3].YearGroup <- 12\nDECLARE i : INTEGER\nFOR i <- 1 TO 3\n   OUTPUT Form[i].Name, " is in year ", Form[i].YearGroup\nNEXT i'
    },
    {
      id: 'as-files', level: 'AS', topic: 'Ch 13 / 14 · Files',
      title: 'Text Files',
      html:
        '<p>Text files store lines of characters read or written one line at a time. Open in a mode, do the I/O, then close.</p>' +
        '<pre class="syntax">OPENFILE "name" FOR READ | WRITE | APPEND\nREADFILE "name", &lt;stringVariable&gt;\nWRITEFILE "name", &lt;data&gt;\nCLOSEFILE "name"</pre>' +
        '<p><code>EOF("name")</code> returns <code>TRUE</code> when there are no more lines to read. <code>WRITE</code> starts a new file; <code>APPEND</code> adds to the end of an existing one.</p>' +
        '<div class="tip"><strong>In this editor:</strong> files live in memory for one run. Use the <strong>Files</strong> panel to pre-load a file before reading it, or <code>WRITE</code> one earlier in the same program.</div>',
      example:
        'OPENFILE "names.txt" FOR WRITE\nWRITEFILE "names.txt", "Ada"\nWRITEFILE "names.txt", "Bo"\nWRITEFILE "names.txt", "Cara"\nCLOSEFILE "names.txt"\n\nDECLARE line : STRING\nDECLARE count : INTEGER\ncount <- 0\nOPENFILE "names.txt" FOR READ\nWHILE NOT EOF("names.txt")\n   READFILE "names.txt", line\n   count <- count + 1\n   OUTPUT count, ": ", line\nENDWHILE\nCLOSEFILE "names.txt"'
    },
    {
      id: 'as-subs', level: 'AS', topic: 'Ch 14 · Subroutines',
      title: 'Procedures & Functions',
      html:
        '<p>Subroutines support decomposition. A <strong>procedure</strong> performs a task; a <strong>function</strong> performs a task and <code>RETURN</code>s a single value used in an expression.</p>' +
        '<pre class="syntax">PROCEDURE &lt;name&gt;(&lt;param&gt; : &lt;type&gt;)\n   &lt;statements&gt;\nENDPROCEDURE\nCALL &lt;name&gt;(&lt;args&gt;)\n\nFUNCTION &lt;name&gt;(&lt;param&gt; : &lt;type&gt;) RETURNS &lt;type&gt;\n   RETURN &lt;value&gt;\nENDFUNCTION</pre>' +
        '<div class="tip"><strong>Exam tip:</strong> Call a procedure with <code>CALL</code>. Never use <code>CALL</code> for a function — a function call appears inside an expression. Executing <code>RETURN</code> exits the function immediately.</div>',
      example:
        'FUNCTION IsEven(n : INTEGER) RETURNS BOOLEAN\n   RETURN (n MOD 2 = 0)\nENDFUNCTION\n\nPROCEDURE Report(n : INTEGER)\n   IF IsEven(n) THEN\n      OUTPUT n, " is even"\n   ELSE\n      OUTPUT n, " is odd"\n   ENDIF\nENDPROCEDURE\n\nDECLARE k : INTEGER\nFOR k <- 1 TO 5\n   CALL Report(k)\nNEXT k'
    },
    {
      id: 'as-params', level: 'AS', topic: 'Ch 14 · Subroutines',
      title: 'Passing Parameters (BYVAL / BYREF)',
      html:
        '<p>Parameters are passed <strong>by value</strong> by default — the subroutine works on a copy, so the caller\'s variable is unchanged. Pass <strong>by reference</strong> with <code>BYREF</code> so changes inside affect the caller\'s variable.</p>' +
        '<pre class="syntax">PROCEDURE Swap(BYREF X : INTEGER, Y : INTEGER)\n   ...\nENDPROCEDURE</pre>' +
        '<div class="tip"><strong>Exam tip:</strong> When several parameters share a mode the keyword need not be repeated — above, both X and Y are BYREF. Parameters should <em>not</em> be passed BYREF to a function.</div>',
      example:
        'PROCEDURE Swap(BYREF X : INTEGER, Y : INTEGER)\n   DECLARE Temp : INTEGER\n   Temp <- X\n   X <- Y\n   Y <- Temp\nENDPROCEDURE\n\nDECLARE a : INTEGER\nDECLARE b : INTEGER\na <- 5\nb <- 9\nCALL Swap(a, b)\nOUTPUT "a = ", a, ", b = ", b'
    },
    {
      id: 'as-builtins', level: 'AS', topic: 'Ch 14 · Built-in Functions',
      title: 'Built-in Functions & String Handling',
      html:
        '<p>9618 provides standard library functions (always given in the exam). String functions:</p>' +
        '<ul><li><code>LENGTH(s)</code> — number of characters</li>' +
        '<li><code>LEFT(s,n)</code> / <code>RIGHT(s,n)</code> — n characters from the start / end</li>' +
        '<li><code>MID(s,p,n)</code> — n characters from position p (positions count from 1)</li>' +
        '<li><code>UCASE(x)</code> / <code>LCASE(x)</code> — change case</li>' +
        '<li><code>ASC(ch)</code> / <code>CHR(n)</code> — character &harr; ASCII code</li>' +
        '<li><code>s[p]</code> — the single character at position p</li></ul>' +
        '<p>Numeric: <code>INT(x)</code> (integer part), <code>STRING_TO_NUM(s)</code>, and join strings with <code>&amp;</code>.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> String positions start at 1. <code>MID("ABCDEFGH", 2, 3)</code> returns <code>"BCD"</code>.</div>',
      example:
        'DECLARE s : STRING\ns <- "Cambridge"\nOUTPUT "Length: ", LENGTH(s)\nOUTPUT "First 4: ", LEFT(s, 4)\nOUTPUT "Mid(4,3): ", MID(s, 4, 3)\nOUTPUT "Upper: ", UCASE(s)\nOUTPUT "Char 1: ", s[1], " (ASCII ", ASC(s[1]), ")"'
    },

    /* ============================ A2 LEVEL ============================ */
    {
      id: 'a2-recursion', level: 'A2', topic: 'Ch 24 · Recursion',
      title: 'Recursion',
      html:
        '<p>A subroutine is <strong>recursive</strong> if it is defined in terms of itself. Every recursive solution needs:</p>' +
        '<ul><li>a <strong>base case</strong> — an explicit answer that stops the recursion;</li>' +
        '<li>a <strong>general case</strong> — defined in terms of itself, and it must move <em>towards</em> the base case each time.</li></ul>' +
        '<p>At run time the system uses a <strong>stack</strong> to store the return address and local values for each call, then unwinds them as each call returns.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> Be ready to (a) trace recursion with a diagram/trace table, and (b) state benefits (clear, compact for naturally recursive problems) and drawbacks (stack memory, risk of stack overflow if the base case is never reached).</div>',
      example:
        'FUNCTION Factorial(n : INTEGER) RETURNS INTEGER\n   IF n <= 1 THEN\n      RETURN 1                 // base case\n   ELSE\n      RETURN n * Factorial(n - 1)   // general case\n   ENDIF\nENDFUNCTION\n\nDECLARE k : INTEGER\nFOR k <- 1 TO 6\n   OUTPUT k, "! = ", Factorial(k)\nNEXT k'
    },
    {
      id: 'a2-binsearch', level: 'A2', topic: 'Ch 23 · Algorithms',
      title: 'Binary Search',
      html:
        '<p>Binary search finds a value in a <strong>sorted</strong> array far faster than linear search. Each step halves the search range, so it is O(log n).</p>' +
        '<ol><li>Look at the middle element.</li>' +
        '<li>If it matches, stop. If the target is smaller, search the left half; if larger, search the right half.</li>' +
        '<li>Repeat until found or the range is empty.</li></ol>' +
        '<div class="tip"><strong>Exam tip:</strong> Binary search <em>requires</em> sorted data. Track two pointers, <code>Low</code> and <code>High</code>; the midpoint is <code>(Low + High) DIV 2</code>.</div>',
      example:
        'DECLARE A : ARRAY[1:8] OF INTEGER\nDECLARE i : INTEGER\nFOR i <- 1 TO 8\n   A[i] <- i * 2          // 2,4,6,...,16 (sorted)\nNEXT i\nDECLARE Target : INTEGER\nDECLARE Low : INTEGER\nDECLARE High : INTEGER\nDECLARE Mid : INTEGER\nDECLARE Found : BOOLEAN\nTarget <- 12\nLow <- 1\nHigh <- 8\nFound <- FALSE\nWHILE Low <= High AND Found = FALSE\n   Mid <- (Low + High) DIV 2\n   IF A[Mid] = Target THEN\n      Found <- TRUE\n      OUTPUT "Found at index ", Mid\n   ELSE\n      IF A[Mid] < Target THEN\n         Low <- Mid + 1\n      ELSE\n         High <- Mid - 1\n      ENDIF\n   ENDIF\nENDWHILE\nIF NOT Found THEN OUTPUT "Not found" ENDIF'
    },
    {
      id: 'a2-insertion', level: 'A2', topic: 'Ch 23 · Algorithms',
      title: 'Insertion Sort',
      html:
        '<p>Insertion sort builds a sorted section at the front of the array. It takes each new element and inserts it into its correct place among the already-sorted elements by shifting larger ones to the right.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> Insertion sort is efficient on nearly-sorted data (close to O(n)); in the worst case it is O(n²), like bubble sort. Be able to compare the two.</div>',
      example:
        'DECLARE A : ARRAY[1:6] OF INTEGER\nDECLARE i : INTEGER\nDECLARE j : INTEGER\nDECLARE key : INTEGER\nA[1]<-5\nA[2]<-2\nA[3]<-9\nA[4]<-1\nA[5]<-6\nA[6]<-3\nFOR i <- 2 TO 6\n   key <- A[i]\n   j <- i - 1\n   WHILE j >= 1 AND A[j] > key\n      A[j+1] <- A[j]\n      j <- j - 1\n   ENDWHILE\n   A[j+1] <- key\nNEXT i\nFOR i <- 1 TO 6\n   OUTPUT A[i]\nNEXT i'
    },
    {
      id: 'a2-adt', level: 'A2', topic: 'Ch 23 · Data Structures',
      title: 'Abstract Data Types (ADTs)',
      html:
        '<p>An <strong>abstract data type</strong> defines a set of values and the operations on them, separately from how it is implemented. The syllabus ADTs are <strong>stack, queue, linked list, binary tree</strong> and <strong>dictionary</strong>.</p>' +
        '<p>When a language lacks an ADT, you build it from existing structures — typically an <code>ARRAY</code> of <code>records</code>, with integer "pointers" (indexes) linking the elements.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> Know each ADT\'s behaviour: stack = LIFO, queue = FIFO, linked list = ordered chain you can insert into cheaply, tree = hierarchical, dictionary = key&rarr;value lookup.</div>',
      example:
        '// Using an array + a size pointer as a simple collection ADT\nDECLARE Items : ARRAY[1:10] OF STRING\nDECLARE Size : INTEGER\nSize <- 0\n// "Add" operation\nSize <- Size + 1\nItems[Size] <- "apple"\nSize <- Size + 1\nItems[Size] <- "pear"\n// "Report" operation\nDECLARE i : INTEGER\nFOR i <- 1 TO Size\n   OUTPUT i, ": ", Items[i]\nNEXT i'
    },
    {
      id: 'a2-stack', level: 'A2', topic: 'Ch 23 · Data Structures',
      title: 'Stacks (LIFO)',
      html:
        '<p>A <strong>stack</strong> is Last-In-First-Out. Implement it with an array and a <code>Top</code> pointer.</p>' +
        '<ul><li><strong>Push</strong>: increment <code>Top</code>, store the value (check for <em>overflow</em> first).</li>' +
        '<li><strong>Pop</strong>: read the value at <code>Top</code>, decrement <code>Top</code> (check for <em>underflow</em> first).</li></ul>' +
        '<div class="tip"><strong>Exam tip:</strong> An empty stack has <code>Top = 0</code>. Always check for overflow (full) when pushing and underflow (empty) when popping.</div>',
      example:
        'DECLARE Stack : ARRAY[1:5] OF INTEGER\nDECLARE Top : INTEGER\nDECLARE i : INTEGER\nTop <- 0\n// push 10, 20, 30\nFOR i <- 1 TO 3\n   IF Top < 5 THEN\n      Top <- Top + 1\n      Stack[Top] <- i * 10\n      OUTPUT "Pushed ", Stack[Top]\n   ENDIF\nNEXT i\n// pop everything (LIFO order)\nWHILE Top > 0\n   OUTPUT "Popped ", Stack[Top]\n   Top <- Top - 1\nENDWHILE'
    },
    {
      id: 'a2-queue', level: 'A2', topic: 'Ch 23 · Data Structures',
      title: 'Queues (FIFO)',
      html:
        '<p>A <strong>queue</strong> is First-In-First-Out. Use an array with two pointers, <code>Front</code> and <code>Rear</code>, and a <code>Count</code> of items. A <strong>circular queue</strong> wraps the pointers around with <code>MOD</code> so space is reused.</p>' +
        '<ul><li><strong>Enqueue</strong>: add at <code>Rear</code>, then advance <code>Rear</code>.</li>' +
        '<li><strong>Dequeue</strong>: remove at <code>Front</code>, then advance <code>Front</code>.</li></ul>' +
        '<div class="tip"><strong>Exam tip:</strong> Keep a <code>Count</code> so you can tell an empty queue (Count = 0) from a full one (Count = size) — with wrap-around the pointers alone are ambiguous.</div>',
      example:
        'CONSTANT MaxSize = 5\nDECLARE Q : ARRAY[1:5] OF INTEGER\nDECLARE Front : INTEGER\nDECLARE Rear : INTEGER\nDECLARE Count : INTEGER\nFront <- 1\nRear <- 0\nCount <- 0\nDECLARE i : INTEGER\n// enqueue 1,2,3\nFOR i <- 1 TO 3\n   Rear <- (Rear MOD MaxSize) + 1\n   Q[Rear] <- i\n   Count <- Count + 1\nNEXT i\n// dequeue all (FIFO)\nWHILE Count > 0\n   OUTPUT "Served ", Q[Front]\n   Front <- (Front MOD MaxSize) + 1\n   Count <- Count - 1\nENDWHILE'
    },
    {
      id: 'a2-linkedlist', level: 'A2', topic: 'Ch 23 · Data Structures',
      title: 'Linked Lists',
      html:
        '<p>A <strong>linked list</strong> is a chain of nodes; each node holds data and a pointer to the next node. Implement it as an <code>ARRAY OF</code> record, where the pointer is the <em>index</em> of the next node (0 means null / end).</p>' +
        '<p>A <code>Head</code> pointer marks the start. To traverse, follow the pointers until you reach 0. Inserting only changes a couple of pointers — no shifting of data.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> Real implementations also keep a <em>free list</em> of unused nodes so you can allocate and reclaim nodes. Use 0 (or &minus;1) consistently as the null pointer.</div>',
      example:
        'TYPE Node\n   DECLARE Data : INTEGER\n   DECLARE Pointer : INTEGER   // index of the next node, 0 = end\nENDTYPE\n\nDECLARE List : ARRAY[1:3] OF Node\nDECLARE Head : INTEGER\n// build chain 10 -> 20 -> 30\nList[1].Data <- 10\nList[1].Pointer <- 2\nList[2].Data <- 20\nList[2].Pointer <- 3\nList[3].Data <- 30\nList[3].Pointer <- 0\nHead <- 1\n// traverse\nDECLARE Current : INTEGER\nCurrent <- Head\nWHILE Current <> 0\n   OUTPUT List[Current].Data\n   Current <- List[Current].Pointer\nENDWHILE'
    },
    {
      id: 'a2-tree', level: 'A2', topic: 'Ch 23 · Data Structures',
      title: 'Binary Trees',
      html:
        '<p>A <strong>binary search tree</strong> stores data so that, for every node, the left subtree holds smaller values and the right subtree holds larger values. Implement nodes as a record with <code>Data</code>, <code>Left</code> and <code>Right</code> index pointers.</p>' +
        '<p>An <strong>in-order traversal</strong> (left, node, right) visits the values in ascending order — and is naturally recursive.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> Know the three traversals: <em>in-order</em> (sorted output), <em>pre-order</em> (node first) and <em>post-order</em> (node last).</div>',
      example:
        'TYPE TreeNode\n   DECLARE Data : INTEGER\n   DECLARE Left : INTEGER\n   DECLARE Right : INTEGER\nENDTYPE\nDECLARE Tree : ARRAY[1:5] OF TreeNode\n// a small BST:        50\n//                    /  \\\n//                  30    70\n//                       /\n//                     60\nTree[1].Data<-50\nTree[1].Left<-2\nTree[1].Right<-3\nTree[2].Data<-30\nTree[2].Left<-0\nTree[2].Right<-0\nTree[3].Data<-70\nTree[3].Left<-4\nTree[3].Right<-0\nTree[4].Data<-60\nTree[4].Left<-0\nTree[4].Right<-0\n\nPROCEDURE InOrder(Root : INTEGER)\n   IF Root <> 0 THEN\n      CALL InOrder(Tree[Root].Left)\n      OUTPUT Tree[Root].Data\n      CALL InOrder(Tree[Root].Right)\n   ENDIF\nENDPROCEDURE\n\nCALL InOrder(1)'
    },
    {
      id: 'a2-hash', level: 'A2', topic: 'Ch 23 · Data Structures',
      title: 'Hash Tables & Dictionaries',
      html:
        '<p>A <strong>hash table</strong> stores items in an array at a position computed from the key by a <strong>hash function</strong> (e.g. <code>key MOD size</code>). This gives near-instant, O(1), lookup on average.</p>' +
        '<p>When two keys hash to the same slot — a <strong>collision</strong> — one simple fix is <em>linear probing</em>: move to the next free slot. A <strong>dictionary</strong> is the ADT that maps keys to values, often built on a hash table.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> A good hash function spreads keys evenly to minimise collisions. Be able to describe at least one collision-handling method.</div>',
      example:
        'CONSTANT Size = 7\nDECLARE Table : ARRAY[0:6] OF INTEGER\nDECLARE i : INTEGER\nFOR i <- 0 TO 6\n   Table[i] <- -1          // -1 means empty\nNEXT i\n\nPROCEDURE Insert(Key : INTEGER)\n   DECLARE pos : INTEGER\n   pos <- Key MOD Size\n   WHILE Table[pos] <> -1          // linear probing\n      pos <- (pos + 1) MOD Size\n   ENDWHILE\n   Table[pos] <- Key\n   OUTPUT "Key ", Key, " stored in slot ", pos\nENDPROCEDURE\n\nCALL Insert(15)\nCALL Insert(22)\nCALL Insert(8)'
    },
    {
      id: 'a2-bigo', level: 'A2', topic: 'Ch 23 · Algorithms',
      title: 'Time Complexity (Big O)',
      html:
        '<p><strong>Big O notation</strong> describes how an algorithm\'s running time grows as the input size <em>n</em> grows. Common orders, best to worst:</p>' +
        '<ul><li><code>O(1)</code> — constant (array index access)</li>' +
        '<li><code>O(log n)</code> — logarithmic (binary search)</li>' +
        '<li><code>O(n)</code> — linear (linear search, one loop)</li>' +
        '<li><code>O(n log n)</code> — e.g. merge sort</li>' +
        '<li><code>O(n²)</code> — quadratic (bubble / insertion sort, nested loops)</li></ul>' +
        '<div class="tip"><strong>Exam tip:</strong> Count the dominant operation. A single loop over n items is O(n); a loop inside a loop is usually O(n²).</div>',
      example:
        '// Count operations: a single loop is O(n), nested loops O(n^2)\nDECLARE n : INTEGER\nDECLARE linear : INTEGER\nDECLARE quad : INTEGER\nDECLARE i : INTEGER\nDECLARE j : INTEGER\nn <- 6\nlinear <- 0\nquad <- 0\nFOR i <- 1 TO n\n   linear <- linear + 1\n   FOR j <- 1 TO n\n      quad <- quad + 1\n   NEXT j\nNEXT i\nOUTPUT "O(n)  operations = ", linear\nOUTPUT "O(n^2) operations = ", quad'
    },
    {
      id: 'a2-files', level: 'A2', topic: 'Ch 26 · File Processing',
      title: 'Random Files & Exception Handling',
      html:
        '<p>A2 adds <strong>random (direct-access) files</strong> of fixed-length records, addressed by record number via a movable file pointer.</p>' +
        '<pre class="syntax">OPENFILE "name" FOR RANDOM\nSEEK "name", &lt;recordNumber&gt;\nGETRECORD "name", &lt;variable&gt;\nPUTRECORD "name", &lt;variable&gt;</pre>' +
        '<p><strong>Exception handling</strong> deals with run-time errors (e.g. bad input, missing file) without crashing — typically a <em>try / catch</em> structure in real languages.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> A <em>serial/sequential</em> file is read in order from the start; a <em>random</em> file can jump straight to any record — much faster for direct lookups.</div>',
      example:
        'TYPE Player\n   DECLARE Name : STRING\n   DECLARE Score : INTEGER\nENDTYPE\nDECLARE p : Player\nDECLARE q : Player\nOPENFILE "scores.dat" FOR RANDOM\np.Name <- "Ada"\np.Score <- 99\nSEEK "scores.dat", 3\nPUTRECORD "scores.dat", p\n// later, read it straight back\nSEEK "scores.dat", 3\nGETRECORD "scores.dat", q\nOUTPUT q.Name, " scored ", q.Score\nCLOSEFILE "scores.dat"'
    },
    {
      id: 'a2-oop1', level: 'A2', topic: 'Ch 27 · OOP',
      title: 'OOP: Classes, Objects & Encapsulation',
      html:
        '<p>Object-oriented programming bundles <strong>attributes</strong> (data) and <strong>methods</strong> (subroutines) into a <strong>class</strong> — a template for creating <strong>objects</strong> (instances).</p>' +
        '<ul><li><strong>Encapsulation</strong>: attributes are <code>PRIVATE</code>; access is only through <code>PUBLIC</code> methods.</li>' +
        '<li>A <strong>constructor</strong> is a method named <code>NEW</code> that initialises a new object.</li>' +
        '<li><strong>Getters</strong> read an attribute; <strong>setters</strong> change it.</li></ul>' +
        '<pre class="syntax">CLASS &lt;Name&gt;\n   PRIVATE &lt;attribute&gt; : &lt;type&gt;\n   PUBLIC PROCEDURE NEW(&lt;params&gt;)\n      ...\n   ENDPROCEDURE\n   PUBLIC FUNCTION &lt;getter&gt;() RETURNS &lt;type&gt;\n      RETURN &lt;attribute&gt;\n   ENDFUNCTION\nENDCLASS\n&lt;object&gt; &lt;- NEW &lt;Name&gt;(&lt;args&gt;)</pre>' +
        '<div class="tip"><strong>Exam tip:</strong> Encapsulation makes objects robust — data can only be changed through controlled methods.</div>',
      example:
        'CLASS BankAccount\n   PRIVATE Holder : STRING\n   PRIVATE Balance : INTEGER\n   PUBLIC PROCEDURE NEW(GivenName : STRING)\n      Holder <- GivenName\n      Balance <- 0\n   ENDPROCEDURE\n   PUBLIC PROCEDURE Deposit(amount : INTEGER)\n      Balance <- Balance + amount\n   ENDPROCEDURE\n   PUBLIC FUNCTION GetBalance() RETURNS INTEGER\n      RETURN Balance\n   ENDFUNCTION\nENDCLASS\n\nDECLARE acc : BankAccount\nacc <- NEW BankAccount("Ada")\nacc.Deposit(100)\nacc.Deposit(50)\nOUTPUT "Balance = ", acc.GetBalance()'
    },
    {
      id: 'a2-oop2', level: 'A2', topic: 'Ch 27 · OOP',
      title: 'OOP: Inheritance & Polymorphism',
      html:
        '<p><strong>Inheritance</strong> lets a subclass reuse and extend a superclass with <code>INHERITS</code>. The subclass constructor calls the parent\'s with <code>SUPER</code>.</p>' +
        '<p><strong>Polymorphism</strong> means a subclass can <em>override</em> an inherited method so the same call behaves differently depending on the object\'s actual class.</p>' +
        '<div class="tip"><strong>Exam tip:</strong> Inheritance models an "is-a" relationship (a Dog <em>is an</em> Animal). Containment/aggregation models "has-a". Don\'t confuse them.</div>',
      example:
        'CLASS Animal\n   PRIVATE Name : STRING\n   PUBLIC PROCEDURE NEW(GivenName : STRING)\n      Name <- GivenName\n   ENDPROCEDURE\n   PUBLIC FUNCTION Speak() RETURNS STRING\n      RETURN Name & " makes a sound"\n   ENDFUNCTION\nENDCLASS\n\nCLASS Dog INHERITS Animal\n   PUBLIC PROCEDURE NEW(GivenName : STRING)\n      SUPER.NEW(GivenName)\n   ENDPROCEDURE\n   PUBLIC FUNCTION Speak() RETURNS STRING   // override\n      RETURN Name & " says Woof"\n   ENDFUNCTION\nENDCLASS\n\nDECLARE a : Animal\nDECLARE d : Dog\na <- NEW Animal("Generic")\nd <- NEW Dog("Rex")\nOUTPUT a.Speak()\nOUTPUT d.Speak()'
    },
    {
      id: 'a2-paradigms', level: 'A2', topic: 'Ch 25 · Paradigms',
      title: 'Programming Paradigms',
      html:
        '<p>A <strong>programming paradigm</strong> is a way of thinking about and structuring programs. The syllabus covers:</p>' +
        '<ul><li><strong>Imperative / procedural</strong> — sequences of commands and procedures (most pseudocode here).</li>' +
        '<li><strong>Object-oriented</strong> — data and behaviour bundled into objects (Ch 27).</li>' +
        '<li><strong>Declarative</strong> — describe facts and rules; the system finds answers (e.g. Prolog, SQL).</li>' +
        '<li><strong>Low-level</strong> — assembly language, close to the hardware (Ch 28).</li></ul>' +
        '<div class="tip"><strong>Exam tip:</strong> Be able to recognise a paradigm from a code sample and justify why a paradigm suits a problem.</div>',
      example:
        '// The SAME task (sum 1..5) in an imperative style\nDECLARE total : INTEGER\nDECLARE i : INTEGER\ntotal <- 0\nFOR i <- 1 TO 5\n   total <- total + i\nNEXT i\nOUTPUT "Imperative result: ", total\n\n// ...and a recursive (still imperative) version of the same idea\nFUNCTION SumTo(n : INTEGER) RETURNS INTEGER\n   IF n = 0 THEN RETURN 0 ENDIF\n   RETURN n + SumTo(n - 1)\nENDFUNCTION\nOUTPUT "Recursive result:  ", SumTo(5)'
    }
  ];

  /* -------------------------------------------------------------- *
   * PRACTICE QUESTIONS
   * -------------------------------------------------------------- */
  var practice = [
    /* -------- AS -------- */
    {
      id: 'q-as-sum', level: 'AS', topic: 'Iteration',
      title: 'Total and average of ten numbers',
      prompt: '<p>Read ten REAL numbers. Output the total as <code>Total = X</code> and the average as <code>Average = Y</code>.</p>',
      starter: 'DECLARE i : INTEGER\nDECLARE value : REAL\nDECLARE total : REAL\ntotal <- 0\n// loop ten times, accumulate, then report\n',
      solution: 'DECLARE i : INTEGER\nDECLARE value : REAL\nDECLARE total : REAL\ntotal <- 0\nFOR i <- 1 TO 10\n   INPUT value\n   total <- total + value\nNEXT i\nOUTPUT "Total = ", total\nOUTPUT "Average = ", total / 10',
      tests: [{ stdin: ['1','2','3','4','5','6','7','8','9','10'] }, { stdin: ['2.5','2.5','2.5','2.5','2.5','2.5','2.5','2.5','2.5','2.5'] }],
      hint: 'Keep a running total inside a FOR loop. The average is total / 10 (a REAL).'
    },
    {
      id: 'q-as-max', level: 'AS', topic: 'Procedures & Functions',
      title: 'Function: maximum of two',
      prompt: '<p>Write a function <code>Max(a, b)</code> that <code>RETURNS</code> the larger of two integers. The grader will call your function with two inputs.</p>',
      starter: 'FUNCTION Max(a : INTEGER, b : INTEGER) RETURNS INTEGER\n   // return the larger value\n\nENDFUNCTION',
      solution: 'FUNCTION Max(a : INTEGER, b : INTEGER) RETURNS INTEGER\n   IF a > b THEN\n      RETURN a\n   ELSE\n      RETURN b\n   ENDIF\nENDFUNCTION',
      append: '\nDECLARE x : INTEGER\nDECLARE y : INTEGER\nINPUT x\nINPUT y\nOUTPUT Max(x, y)',
      tests: [{ stdin: ['3','8'] }, { stdin: ['20','5'] }, { stdin: ['7','7'] }],
      hint: 'Compare a and b with IF; RETURN the larger. Do not use OUTPUT inside the function.'
    },
    {
      id: 'q-as-linsearch', level: 'AS', topic: 'Searching',
      title: 'Linear search',
      prompt: '<p>Read <code>n</code>, then <code>n</code> names, then a target name. Using a linear search, output <code>Found at X</code> (the 1-based position) or <code>Not found</code>.</p>',
      starter: 'DECLARE n : INTEGER\nINPUT n\nDECLARE names : ARRAY[1:100] OF STRING\nDECLARE i : INTEGER\n// read the names, read the target, search\n',
      solution: 'DECLARE n : INTEGER\nINPUT n\nDECLARE names : ARRAY[1:100] OF STRING\nDECLARE i : INTEGER\nFOR i <- 1 TO n\n   INPUT names[i]\nNEXT i\nDECLARE target : STRING\nINPUT target\nDECLARE found : BOOLEAN\nfound <- FALSE\nFOR i <- 1 TO n\n   IF names[i] = target THEN\n      found <- TRUE\n      OUTPUT "Found at ", i\n   ENDIF\nNEXT i\nIF found = FALSE THEN\n   OUTPUT "Not found"\nENDIF',
      tests: [{ stdin: ['3','Ali','Bo','Cara','Bo'] }, { stdin: ['3','Ali','Bo','Cara','Dev'] }, { stdin: ['1','Sam','Sam'] }],
      hint: 'Read n names into the array, read the target, then loop with a Found flag.'
    },
    {
      id: 'q-as-bubble', level: 'AS', topic: 'Sorting',
      title: 'Bubble sort',
      prompt: '<p>Read six integers into an array, sort them into ascending order with a bubble sort, and output them one per line.</p>',
      starter: 'DECLARE A : ARRAY[1:6] OF INTEGER\nDECLARE i : INTEGER\nFOR i <- 1 TO 6\n   INPUT A[i]\nNEXT i\n// sort, then output\n',
      solution: 'DECLARE A : ARRAY[1:6] OF INTEGER\nDECLARE i : INTEGER\nDECLARE j : INTEGER\nDECLARE temp : INTEGER\nFOR i <- 1 TO 6\n   INPUT A[i]\nNEXT i\nFOR i <- 1 TO 5\n   FOR j <- 1 TO 6 - i\n      IF A[j] > A[j+1] THEN\n         temp <- A[j]\n         A[j] <- A[j+1]\n         A[j+1] <- temp\n      ENDIF\n   NEXT j\nNEXT i\nFOR i <- 1 TO 6\n   OUTPUT A[i]\nNEXT i',
      tests: [{ stdin: ['5','1','4','2','8','3'] }, { stdin: ['6','5','4','3','2','1'] }, { stdin: ['1','1','2','2','3','3'] }],
      hint: 'Nested loops: the inner loop compares adjacent pairs A[j] and A[j+1] and swaps if out of order.'
    },
    {
      id: 'q-as-vowels', level: 'AS', topic: 'String Handling',
      title: 'Count the vowels',
      prompt: '<p>Read a word and output how many vowels (a, e, i, o, u) it contains, as <code>Vowels = X</code>. Treat upper and lower case the same.</p>',
      starter: 'DECLARE w : STRING\nDECLARE i : INTEGER\nINPUT w\n// examine each character and count vowels\n',
      solution: 'DECLARE w : STRING\nDECLARE i : INTEGER\nDECLARE count : INTEGER\nDECLARE ch : CHAR\nINPUT w\ncount <- 0\nFOR i <- 1 TO LENGTH(w)\n   ch <- LCASE(w[i])\n   IF ch = "a" OR ch = "e" OR ch = "i" OR ch = "o" OR ch = "u" THEN\n      count <- count + 1\n   ENDIF\nNEXT i\nOUTPUT "Vowels = ", count',
      tests: [{ stdin: ['Education'] }, { stdin: ['rhythm'] }, { stdin: ['AEIOU'] }],
      hint: 'Loop position 1..LENGTH(w). Get each character with w[i], lower-case it, and test the five vowels.'
    },
    {
      id: 'q-as-reverse', level: 'AS', topic: 'String Handling',
      title: 'Reverse a string',
      prompt: '<p>Read a string and output it reversed, using string indexing (<code>s[i]</code>).</p>',
      starter: 'DECLARE s : STRING\nDECLARE result : STRING\nDECLARE i : INTEGER\nINPUT s\nresult <- ""\n// build the reversed string\n',
      solution: 'DECLARE s : STRING\nDECLARE result : STRING\nDECLARE i : INTEGER\nINPUT s\nresult <- ""\nFOR i <- LENGTH(s) TO 1 STEP -1\n   result <- result & s[i]\nNEXT i\nOUTPUT result',
      tests: [{ stdin: ['pseudocode'] }, { stdin: ['radar'] }, { stdin: ['AB'] }],
      hint: 'Loop from LENGTH(s) down to 1 with STEP -1, concatenating each character onto result.'
    },
    {
      id: 'q-as-2dsum', level: 'AS', topic: '2D Arrays',
      title: 'Row totals of a grid',
      prompt: '<p>Read 9 integers that fill a 3&times;3 grid (row by row). Output the total of each row as <code>Row r = total</code> (three lines).</p>',
      starter: 'DECLARE G : ARRAY[1:3, 1:3] OF INTEGER\nDECLARE r : INTEGER\nDECLARE c : INTEGER\n// read the 9 values row by row, then total each row\n',
      solution: 'DECLARE G : ARRAY[1:3, 1:3] OF INTEGER\nDECLARE r : INTEGER\nDECLARE c : INTEGER\nDECLARE total : INTEGER\nFOR r <- 1 TO 3\n   FOR c <- 1 TO 3\n      INPUT G[r, c]\n   NEXT c\nNEXT r\nFOR r <- 1 TO 3\n   total <- 0\n   FOR c <- 1 TO 3\n      total <- total + G[r, c]\n   NEXT c\n   OUTPUT "Row ", r, " = ", total\nNEXT r',
      tests: [{ stdin: ['1','2','3','4','5','6','7','8','9'] }, { stdin: ['0','0','0','10','10','10','1','2','3'] }],
      hint: 'Use nested loops to read the grid, then nested loops again to total each row.'
    },
    {
      id: 'q-as-record', level: 'AS', topic: 'Records',
      title: 'Student record',
      prompt: '<p>Define a record with <code>Name</code> (STRING) and <code>Age</code> (INTEGER). Read a name then an age into a record variable, and output <code>Name is Age years old</code>.</p>',
      starter: 'TYPE Student\n   DECLARE Name : STRING\n   DECLARE Age : INTEGER\nENDTYPE\nDECLARE p : Student\n// read into p.Name and p.Age, then output the sentence\n',
      solution: 'TYPE Student\n   DECLARE Name : STRING\n   DECLARE Age : INTEGER\nENDTYPE\nDECLARE p : Student\nINPUT p.Name\nINPUT p.Age\nOUTPUT p.Name, " is ", p.Age, " years old"',
      tests: [{ stdin: ['Leroy','16'] }, { stdin: ['Ada','12'] }],
      hint: 'Use dot notation: INPUT p.Name then INPUT p.Age, then OUTPUT them in the sentence.'
    },

    /* -------- A2 -------- */
    {
      id: 'q-a2-factorial', level: 'A2', topic: 'Recursion',
      title: 'Recursive factorial',
      prompt: '<p>Write a <strong>recursive</strong> function <code>Factorial(n)</code> that returns n!. The grader calls it with an input value.</p>',
      starter: 'FUNCTION Factorial(n : INTEGER) RETURNS INTEGER\n   // base case + recursive case\n\nENDFUNCTION',
      solution: 'FUNCTION Factorial(n : INTEGER) RETURNS INTEGER\n   IF n <= 1 THEN\n      RETURN 1\n   ELSE\n      RETURN n * Factorial(n - 1)\n   ENDIF\nENDFUNCTION',
      append: '\nDECLARE k : INTEGER\nINPUT k\nOUTPUT Factorial(k)',
      tests: [{ stdin: ['1'] }, { stdin: ['5'] }, { stdin: ['7'] }],
      hint: 'Base case: n <= 1 returns 1. Recursive case: return n * Factorial(n - 1).'
    },
    {
      id: 'q-a2-fib', level: 'A2', topic: 'Recursion',
      title: 'Recursive Fibonacci',
      prompt: '<p>Write a recursive function <code>Fib(n)</code> where <code>Fib(1)=1</code>, <code>Fib(2)=1</code>, and <code>Fib(n)=Fib(n-1)+Fib(n-2)</code>. The grader inputs n and outputs <code>Fib(n)</code>.</p>',
      starter: 'FUNCTION Fib(n : INTEGER) RETURNS INTEGER\n   // two base cases, one recursive case\n\nENDFUNCTION',
      solution: 'FUNCTION Fib(n : INTEGER) RETURNS INTEGER\n   IF n <= 2 THEN\n      RETURN 1\n   ELSE\n      RETURN Fib(n - 1) + Fib(n - 2)\n   ENDIF\nENDFUNCTION',
      append: '\nDECLARE k : INTEGER\nINPUT k\nOUTPUT Fib(k)',
      tests: [{ stdin: ['1'] }, { stdin: ['7'] }, { stdin: ['10'] }],
      hint: 'Return 1 when n <= 2; otherwise return Fib(n-1) + Fib(n-2).'
    },
    {
      id: 'q-a2-binsearch', level: 'A2', topic: 'Searching',
      title: 'Binary search',
      prompt: '<p>Read <code>n</code>, then <code>n</code> integers <em>already in ascending order</em>, then a target. Use binary search to output <code>Found at X</code> (1-based) or <code>Not found</code>.</p>',
      starter: 'DECLARE n : INTEGER\nINPUT n\nDECLARE A : ARRAY[1:100] OF INTEGER\nDECLARE i : INTEGER\nFOR i <- 1 TO n\n   INPUT A[i]\nNEXT i\nDECLARE target : INTEGER\nINPUT target\n// binary search using Low / High pointers\n',
      solution: 'DECLARE n : INTEGER\nINPUT n\nDECLARE A : ARRAY[1:100] OF INTEGER\nDECLARE i : INTEGER\nFOR i <- 1 TO n\n   INPUT A[i]\nNEXT i\nDECLARE target : INTEGER\nINPUT target\nDECLARE low : INTEGER\nDECLARE high : INTEGER\nDECLARE mid : INTEGER\nDECLARE found : BOOLEAN\nlow <- 1\nhigh <- n\nfound <- FALSE\nWHILE low <= high AND found = FALSE\n   mid <- (low + high) DIV 2\n   IF A[mid] = target THEN\n      found <- TRUE\n      OUTPUT "Found at ", mid\n   ELSE\n      IF A[mid] < target THEN\n         low <- mid + 1\n      ELSE\n         high <- mid - 1\n      ENDIF\n   ENDIF\nENDWHILE\nIF found = FALSE THEN\n   OUTPUT "Not found"\nENDIF',
      tests: [{ stdin: ['7','2','4','6','8','10','12','14','10'] }, { stdin: ['7','2','4','6','8','10','12','14','5'] }, { stdin: ['5','1','3','5','7','9','1'] }],
      hint: 'Use low and high pointers; mid = (low + high) DIV 2. Move low or high depending on the comparison.'
    },
    {
      id: 'q-a2-insertion', level: 'A2', topic: 'Sorting',
      title: 'Insertion sort',
      prompt: '<p>Read <code>n</code>, then <code>n</code> integers. Sort them ascending using an <strong>insertion sort</strong> and output them one per line.</p>',
      starter: 'DECLARE n : INTEGER\nINPUT n\nDECLARE A : ARRAY[1:100] OF INTEGER\nDECLARE i : INTEGER\nFOR i <- 1 TO n\n   INPUT A[i]\nNEXT i\n// insertion sort, then output\n',
      solution: 'DECLARE n : INTEGER\nINPUT n\nDECLARE A : ARRAY[1:100] OF INTEGER\nDECLARE i : INTEGER\nDECLARE j : INTEGER\nDECLARE key : INTEGER\nFOR i <- 1 TO n\n   INPUT A[i]\nNEXT i\nFOR i <- 2 TO n\n   key <- A[i]\n   j <- i - 1\n   WHILE j >= 1 AND A[j] > key\n      A[j+1] <- A[j]\n      j <- j - 1\n   ENDWHILE\n   A[j+1] <- key\nNEXT i\nFOR i <- 1 TO n\n   OUTPUT A[i]\nNEXT i',
      tests: [{ stdin: ['5','5','2','9','1','6'] }, { stdin: ['4','4','3','2','1'] }, { stdin: ['3','1','2','3'] }],
      hint: 'For each element from the 2nd, hold it as key and shift larger earlier elements right until key fits.'
    },
    {
      id: 'q-a2-stack', level: 'A2', topic: 'ADT · Stack',
      title: 'Reverse with a stack',
      prompt: '<p>Read <code>n</code>, then <code>n</code> integers. Push each onto a stack (an array with a <code>Top</code> pointer), then pop them all, outputting each on its own line — i.e. in reverse order.</p>',
      starter: 'DECLARE stack : ARRAY[1:100] OF INTEGER\nDECLARE top : INTEGER\nDECLARE n : INTEGER\nDECLARE i : INTEGER\nDECLARE v : INTEGER\ntop <- 0\nINPUT n\n// push n values then pop them all\n',
      solution: 'DECLARE stack : ARRAY[1:100] OF INTEGER\nDECLARE top : INTEGER\nDECLARE n : INTEGER\nDECLARE i : INTEGER\nDECLARE v : INTEGER\ntop <- 0\nINPUT n\nFOR i <- 1 TO n\n   INPUT v\n   top <- top + 1\n   stack[top] <- v\nNEXT i\nWHILE top > 0\n   OUTPUT stack[top]\n   top <- top - 1\nENDWHILE',
      tests: [{ stdin: ['3','10','20','30'] }, { stdin: ['5','1','2','3','4','5'] }, { stdin: ['1','99'] }],
      hint: 'Push: top <- top + 1 then stack[top] <- v. Pop: output stack[top] then top <- top - 1, while top > 0.'
    },
    {
      id: 'q-a2-queue', level: 'A2', topic: 'ADT · Queue',
      title: 'Process a queue (FIFO)',
      prompt: '<p>Read <code>n</code>, then <code>n</code> integers. Enqueue them all, then dequeue them all, outputting each as it is served — i.e. in the <em>same</em> order they arrived.</p>',
      starter: 'DECLARE q : ARRAY[1:100] OF INTEGER\nDECLARE front : INTEGER\nDECLARE rear : INTEGER\nDECLARE n : INTEGER\nDECLARE i : INTEGER\nDECLARE v : INTEGER\nfront <- 1\nrear <- 0\nINPUT n\n// enqueue n values, then dequeue them all\n',
      solution: 'DECLARE q : ARRAY[1:100] OF INTEGER\nDECLARE front : INTEGER\nDECLARE rear : INTEGER\nDECLARE n : INTEGER\nDECLARE i : INTEGER\nDECLARE v : INTEGER\nfront <- 1\nrear <- 0\nINPUT n\nFOR i <- 1 TO n\n   INPUT v\n   rear <- rear + 1\n   q[rear] <- v\nNEXT i\nWHILE front <= rear\n   OUTPUT q[front]\n   front <- front + 1\nENDWHILE',
      tests: [{ stdin: ['3','10','20','30'] }, { stdin: ['4','7','8','9','10'] }, { stdin: ['1','42'] }],
      hint: 'Enqueue: rear <- rear + 1 then q[rear] <- v. Dequeue: output q[front] then front <- front + 1, while front <= rear.'
    },
    {
      id: 'q-a2-account', level: 'A2', topic: 'OOP',
      title: 'BankAccount class',
      prompt: '<p>Define a class <code>BankAccount</code> with a private <code>Balance</code> (starting at 0), a constructor, a <code>Deposit(amount)</code> method and a <code>Withdraw(amount)</code> method (which must not let the balance go below 0). Then: create an account, read a series of operations and output the final balance as <code>Balance = X</code>.</p><p>Input format: first a number of operations <code>m</code>, then <code>m</code> lines each being a word (<code>D</code> or <code>W</code>) and you read the amount on the next line.</p>',
      starter: 'CLASS BankAccount\n   PRIVATE Balance : INTEGER\n   // constructor, Deposit, Withdraw, GetBalance\nENDCLASS\nDECLARE acc : BankAccount\nacc <- NEW BankAccount()\nDECLARE m : INTEGER\nDECLARE i : INTEGER\nDECLARE op : STRING\nDECLARE amt : INTEGER\nINPUT m\n// process m operations, then output the balance\n',
      solution: 'CLASS BankAccount\n   PRIVATE Balance : INTEGER\n   PUBLIC PROCEDURE NEW()\n      Balance <- 0\n   ENDPROCEDURE\n   PUBLIC PROCEDURE Deposit(amount : INTEGER)\n      Balance <- Balance + amount\n   ENDPROCEDURE\n   PUBLIC PROCEDURE Withdraw(amount : INTEGER)\n      IF amount <= Balance THEN\n         Balance <- Balance - amount\n      ENDIF\n   ENDPROCEDURE\n   PUBLIC FUNCTION GetBalance() RETURNS INTEGER\n      RETURN Balance\n   ENDFUNCTION\nENDCLASS\nDECLARE acc : BankAccount\nacc <- NEW BankAccount()\nDECLARE m : INTEGER\nDECLARE i : INTEGER\nDECLARE op : STRING\nDECLARE amt : INTEGER\nINPUT m\nFOR i <- 1 TO m\n   INPUT op\n   INPUT amt\n   IF op = "D" THEN\n      acc.Deposit(amt)\n   ELSE\n      acc.Withdraw(amt)\n   ENDIF\nNEXT i\nOUTPUT "Balance = ", acc.GetBalance()',
      tests: [{ stdin: ['3','D','100','D','50','W','30'] }, { stdin: ['2','D','40','W','100'] }, { stdin: ['1','D','75'] }],
      hint: 'Withdraw should only subtract if amount <= Balance. Read op then amt for each of the m operations.'
    },
    {
      id: 'q-a2-linkedlist', level: 'A2', topic: 'ADT · Linked List',
      title: 'Traverse a linked list',
      prompt: '<p>A linked list is stored as an array of records with <code>Data</code> and <code>Pointer</code> fields. Read <code>n</code>, then <code>n</code> data values (store them so node <code>i</code> points to node <code>i+1</code>, and the last points to 0, with Head = 1). Then traverse from Head, outputting each value on its own line.</p>',
      starter: 'TYPE Node\n   DECLARE Data : INTEGER\n   DECLARE Pointer : INTEGER\nENDTYPE\nDECLARE List : ARRAY[1:100] OF Node\nDECLARE n : INTEGER\nDECLARE i : INTEGER\nDECLARE Head : INTEGER\nINPUT n\n// build the chain, set Head, then traverse\n',
      solution: 'TYPE Node\n   DECLARE Data : INTEGER\n   DECLARE Pointer : INTEGER\nENDTYPE\nDECLARE List : ARRAY[1:100] OF Node\nDECLARE n : INTEGER\nDECLARE i : INTEGER\nDECLARE Head : INTEGER\nINPUT n\nFOR i <- 1 TO n\n   INPUT List[i].Data\n   IF i < n THEN\n      List[i].Pointer <- i + 1\n   ELSE\n      List[i].Pointer <- 0\n   ENDIF\nNEXT i\nHead <- 1\nDECLARE Current : INTEGER\nCurrent <- Head\nWHILE Current <> 0\n   OUTPUT List[Current].Data\n   Current <- List[Current].Pointer\nENDWHILE',
      tests: [{ stdin: ['3','10','20','30'] }, { stdin: ['1','5'] }, { stdin: ['4','4','3','2','1'] }],
      hint: 'Node i links to i+1, except the last links to 0. Traverse with a Current pointer until it is 0.'
    }
  ];

  var CONTENT = { lessons: lessons, practice: practice };
  if (typeof module !== 'undefined' && module.exports) module.exports = CONTENT;
  global.PSEUDO_CONTENT = CONTENT;

})(typeof window !== 'undefined' ? window : globalThis);
