Testing
=======



Purpose
-------

These test files are provided for functional testability of the add-on.
Ideally automated testing but if that's not possible, at least as an aid for
manual testing.



Background
----------

According to the [RFC 5322] the following is true:

1. The message-id header may be present or not. See the [multiplicity table]
   here.

2. The message-id header is in the form:

    ```
    "Message-ID:" [CFWS] "<" id-left "@" id-right ">" [CFWS] CRLF
    ```

    * Where `CFWS` means Comment or Folding White Space.
    * See the [message-id definition] here and the [CFWS definition] here.
    * `id-left` and `id-right` are either a `dot-atom-text` (which does not
      allow spacing nor folding) or either (for old-compatibility) other
      possible definitions.
    * For those old definitions, also see the [RFC prohibition] that forbids
      comments or spacing within the local part or the domain name (point
      18).

3. In addition, as explained in this [stack overflow answer] the strings are
   case insensitive as defined in the [RFC 5234] section 2.3 "Terminal
   values" in the "NOTE: ABNF strings are case insensitive [...]"



Valid cases
-----------

This all means that any of those cases are valid (among many, many others):

Canonical:

    Message-ID: <1234@example.com>

Without initial spacing:

    Message-ID:<1234@example.com>

With more spaces:

    Message-ID:                  <1234@example.com>

With lowercase:

    message-id: <1234@example.com>

With weird casing:

    mEsSaGe-iD: <1234@example.com>

With folding before a canonical Id:

    Message-ID:
        <1234@example.com>

With comment before:

    Message-ID: (Alice went home)<1234@example.com>

With comment and folding before, full comment in a line:

    Message-ID: (Alice went home)
        <1234@example.com>

With comment and folding before, folding in the middle of the comment:

    Message-ID: (Alice
        went home)<1234@example.com>

With comments and folding before and after and nested comments:

    Message-ID: (Alice
        went home)         <1234@example.com>         (to give (me
     some pizza) italian pizza, sure)



Invalid cases
-------------

Should this add-on process semantically anything when copying raw data?
Probably not. At the end, *raw data* is that: *raw data*.

Nevertheless the add-on might (or not) have an implementation when copying
interpreted/parsed data and the Message-ID is invalid.

Whatever the behaviour is defined, we should have some testing cases that
hold invalid syntax to help developing and testing the [sad path].

The following cases are invalid cases for the RFC that are still
well-catched by the add-on when doing raw-copy:

Missing brackets:

    Message-ID: no@angle.brackets

Missing at:

    Message-ID: <alice>

Missing all:

    Message-ID: alice

Spaces within the brackets:

    Message-ID: < there should @ not be . spaces here >

CRLF within the brackets:

    Message-ID: <there.should.not.be
        @new.lines>

Non-conforming weird:

    Message-ID:    badly
     formatted
            identifier
      as             missing the
            angle brackets ) and at-sign
            and have
      unbalanced (
        parentheses



Is the Message-ID the last one?
-------------------------------

For testing purposes all those previous examples may occur just before
another header, or as the last header in the email. For example:

`Message-ID` is followed by another header:
```
Message-ID: <1234@example.com>
Some-Other-Header: abc

Hello friends
```

`Message-ID` is the last header:
```
Some-Other-Header: abc
Message-ID: <1234@example.com>

Hello friends
```



Number of test cases
--------------------

If we do a "cartesian product" of all the combinations of the indepedent
factors, there could be some hundreds or thousands of test-cases.

This could only be useful if we had a mechanism to "automate" the testing of
this add-on (maybe creating another add-on that selects the emails in a
folder one-by-one) and then makes a "click" on the copy-button.

In the meantime we don't have this, we should reduce the number of cases to
something manually testable.

**We are going to make this assumption:** If the add-on works with  the most
complex cases, then it will work for the simpler ones. This is not always
necessarily true, but for the case, it's better to embrace this as a working
hypotheses than not having any test case at all.



Unitarity
---------

A good testing suite should have "a specific test" for "each single thing
that might happen". This is broken here. Say for example this test:

`test-oneliner-uppercase-comment-id-last.eml`

We are mixing here to "test uppercase" and "test comment before the ID".

This relates to the previous section "Number of test cases". If we wanted to
test each single thing, the number of tests would explode and would not be
suitable for manual testing.

So this rule is broken not by lack of knowledge but broken on purpose having
evaluated this specific situation.

Nevertheless if we achieve "automatic testing", we **should** then
definitively raise the number of tests to check "every thing separately".

In the meantime we have chosen random combinations that seem rather
representative of the most weird cases we could encounter and we should be
able to process, as well as covering the most common and normal cases too.



How to test
-----------

1. **Setup**

    1. In Thunderbird, in any operative account (it can be a remote host or
       it also works in the `Local Folders`) create a new temporal fresh
       clean folder. For example call it `_test`.
    2. Drag-and-drop all the sample emails. Files ending in `.eml`.
    3. Sort them by subject (the date could be confusing as we created some
       weird (valid) emails with weird dates).

2. **Exercise**

    For each email in the test folder
    1. Click the add-on button.
    2. Paste the result in your favourite text editor to see the contents.

3. **Verify**

    For each pasted result:
    1. See that the pasted text is what you expect.
    2. To know that, note that the Message-ID itself contains a verbose name
       that represents the case name, so you can easily see that what you
       pasted is exactly the test case your are exercising.

4. **Teardown**

    1. Delete the folder you created. For example `_test`. If prompted,
       accept to delete the contents.



Editing the test cases
----------------------

**Warning with same Message-IDs:**

If you are developing and you want load a test in Thunderbird and afterwards
you want to edit it, then make sure you first eliminate the same test from
the Thunderbird, otherwise it may be confused by multiple instances with the
same Message-ID.

For example, say you load the `test-missing.eml` in Thunderbird. You then
will see an email with the subject `Test missing` in the Thunderbird panel.
Then, you edit the `test-missing.eml` and change the subject to this:

    Subject: Cool

and then you drag-and-drop this email to Thunderbird without deleting the old
one. You expect to have two emails one saying `Test missing` and the other
saying `Cool`. But as the `Message-ID` is the same, Thunderbird gets confused
and shows two messages named `Test missing`. We can't blame Thunderbird, it's
a sad path as it's assumed no distinct messages have the same id.

To correct this behaviour clean the test list.

Try this: From within the `_test` folder, with the focus in the email-list,
press `CTRL+a` and `DEL`. This will leave the `_test` folder empty.

The next time you drag-and-drop `test-missing.eml` you'll see `Cool` as the
subject.   

**Warning with the Thunderbird cache:**

For some reason, if you delete the tests and you put them again in the
folder, Thunderbird might think it has to lead some info from its internal
caches.

If you fail to get the good data, don't hesitate the reproduce steps 4 and 1
in the testing method to force a cleanup: Delete the whole folder, not only
its contents, and re-create the folder. This will force Thunderbird to make
new caches.



Example emails in the RFC
-------------------------

The RFC contains many examples. To be noted this [canonical example in the
RFC] and this [aesthetically displeasing example in the RFC]. I will take
them as the base to later on create variations from them.

RFC's canonical example:
```
From: John Doe <jdoe@machine.example>
To: Mary Smith <mary@example.net>
Subject: Saying Hello
Date: Fri, 21 Nov 1997 09:55:06 -0600
Message-ID: <1234@local.machine.example>

This is a message just to say hello.
So, "Hello".
```

RFC's aesthetically displeasing example: 
```
From: Pete(A nice \) chap) <pete(his account)@silly.test(his host)>
To:A Group(Some people)
    :Chris Jones <c@(Chris's host.)public.example>,
        joe@example.org,
 John <jdoe@one.test> (my dear friend); (the end of the group)
Cc:(Empty list)(start)Hidden recipients  :(nobody(that I know))  ;
Date: Thu,
     13
       Feb
         1969
     23:32
              -0330 (Newfoundland Time)
Message-ID:              <testabcd.1234@silly.test>

Testing.
```



Final test cases
----------------

The final test cases are the `.eml` files in this folder.

They follow those rules:

* The filename follows the pattern `test-case-name` + the extension `.eml`

* They all are named lowercase with dashes (`-`) to separate words.

* They all begin with `test-`

* All tests are valid RFC formats unless the test case name begins with
  `test-invalid-`.

* They all end with `-last` or `-nonlast` to indicate if the header is the
  last one before the blank row or there are more headers following the
  `Message-ID` header. There's one exception to this rule and it is the
  `test-missing` case for which it does not make sense.

* The `canonical` keyword means the de facto standard (the typical case).

* The `Subject` header of all tests contain the test name itself to help
  selecting it in the *exercise* phase of testing and identifying it in the
  *verification* phase.

* The body of the email gives a brief explanation of the test singularities. 



About the test names
--------------------

The test names contain descriptive switches in order. Not all the switches
are present if something is not rare or weird.

Some of them, for example:

* **Overall line type:**
    oneliner | folded | invalid | missing

* **About the key:**
    uppercase | lowercase | weirdcase

* **About the sorrounding of the ID:**
    optional-CFWS-type "id" optional-CFWS-type, where optional-CFWS-type
    is something like comment | fold | commentfold | nestedcomment, etc.

* **About the position:**
    last | nonlast  

Happy testing! 



[RFC 5322]: https://tools.ietf.org/html/rfc5322
[multiplicity table]: https://tools.ietf.org/html/rfc5322#section-3.6
[message-id definition]: https://tools.ietf.org/html/rfc5322#section-3.6.4
[CFWS definition]: https://tools.ietf.org/html/rfc5322#section-3.2.2
[RFC prohibition]: https://tools.ietf.org/html/rfc5322#appendix-B
[stack overflow answer]: https://stackoverflow.com/questions/6143549/are-email-headers-case-sensitive
[RFC 5234]: https://tools.ietf.org/html/rfc5234#section-2.3
[sad path]: https://en.wikipedia.org/wiki/Happy_path
[canonical example in the RFC]: https://tools.ietf.org/html/rfc5322#appendix-A.1.1
[aesthetically displeasing example in the RFC]: https://tools.ietf.org/html/rfc5322#appendix-A.5
