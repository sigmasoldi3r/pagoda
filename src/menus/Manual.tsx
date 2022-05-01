/*
  This view contains the docs for developing Pagoda games.
  A guide about the engine, and a guide about the language.
*/

import Markdown from 'react-markdown'
// import 'prismjs/themes/prism.css'
import 'prismjs/themes/prism-tomorrow.css'
import { useEffect } from 'react'
import Code from '../components/Code'
import * as Prism from 'prismjs'

// This view contains all the docs.
export default function Manual() {
  useEffect(() => {
    Prism.highlightAll()
  }, [])
  return (
    <div
      style={{
        overflowY: 'scroll',
        overflowX: 'hidden',
        maxWidth: '100vw',
        height: '100%',
      }}
    >
      <Markdown
        components={{
          code: opts => <Code src={String(opts.children)} lang="pagoda" />,
        }}
      >
        {`
# Pagoda Manual

This page contains a summary of all that pagoda engine can offer, ranging
from a simple usage documentation to a fully extended, in-depth guide
about the language.

## The Language

Pagoda Engine comes with a built-in, custom scripting language, an ad-hoc
solution for the narrative nature of the engine.

Programs are declared in this way, making them safe (As no malicious code
  execution is possible), and easier to script, as the language is designed
  to follow with the flow of the tale.

Also Pagoda uses markdown for text highlight, a very well-known language
that is used for simple documents.

~~~pagoda
##
# This is a sample
# Pagoda script
##

# This makes all the
# narrations to wait
# for user
wait always

# Say hello world
"Hello World!"
~~~

Although it takes alot from the "programming world", the language is
intended to be readable at first glance, or almost for simple statements.

This means that if you read something like:

~~~pagoda
# An empty list
set inventory to []
if
  inventory's 1st
  is nothing
{
    "Oh!
    Nothing there..."
}
~~~

It means what you're thinking: If the 1st slot of the inventory
contains nothing, then show a "Nothing there" message.

## Basics

This section covers the basic aspects of a simple script.

### Narration

The whole thing revolves around displaying text to the player, asking
for feedback and evaluating conditions based on that feedback or
user interaction.

You can tell the player a story via either a narrator, or characters.

Narrations occur when a text between quotes is found, and is not being
used as a value (Like making a list of words, or as a choice label).

~~~pagoda
# Most basic
# narration
"Hey!
My name is Mr. Narrator."
"I'm omnipresent"
"I'm a narrator after all"
~~~

Notice that text can span across multiple lines.

Next you might want to make a character say something,
you can customize it by placing another text depicting the
name of the character:

~~~pagoda
:Evans "Meh"
~~~

Notice that we're using :Evans instead of just "Evans",
which is 100% the same, but if you don't have any space in your
text, you can use : to avoid quoting. This is totally optional,
you can stick to "..." always.

### Dialogues and basic flow

You might want to set the player to tap the screen in order to
continue, you shall use the **wait** keyword:

~~~pagoda
# Basic modes:
wait always
wait never

# Advanced
wait character
wait narrator
wait choice
~~~

Those statements will enable or disable the narration and dialogues
to wait by default, depending if you set them to always and never.
The other three examples are covered in the advanced section.

You might want to deliberately disable the wait (Which is indeed disabled
by default), and then just wait after some statements. In order to do
this, just place a **wait** statement without anything else:

~~~pagoda
# This is not needed,
# as is the default
# behavior:
wait never

# Either dialogues
# and narrations
# work:
"Howdy!"
wait

:You "..."
wait
~~~

In pagoda, **Characters** might have assigned colors for their
names, and even expressions. This is achieved by declaring
them, and storing them in variables:

~~~pagoda
character "You" as y

y "_Something is off..._"
y "Yikes!"
"Oh boy!
The floor is **shaking**!"
~~~

We'll cover the details of how characters can be tweaked to
store expressions, poses, states and colors in detail later on,
in the advanced section.

For now, just let's say that declaring characters will make
your game script less repetitive and less bloated.

### Variables

When it comes to making the script to remember something,
you might want to use what we call **variables**.

Basically, a variable is just a value that you have stored
along with a name, in order to read and modify it later.

Let's imagine that you want to store the health of your
main character, starting from 100 for instance:

~~~pagoda
set health to 100
~~~

That's it! You have set a variable called **health** to
the value of _100_! Easy right?

Then, you can make use of it later:

~~~pagoda
set health to 100
"The player's health
is now $health"
~~~

With the dollar sign inside a quoted string, you can read
the value of those variables, and put them into text.

If you want, you can modify the variable and even perform
arithmetic on it's value:

~~~pagoda
set health to health - 1
~~~

Here what we're saying is: set my variable named "health" to
the value of subtracting 1 to a variable named "health" (Which is
itself, in this case).

This means that if we start with a value of _100_, then when
we arrive to this statement, it evaluates that health must now
be 100 - 1 (99), because _"health"_ was 100 at that moment.

As said, you can perform all sort of arithmetics:

~~~pagoda
set bigBrain
to 1 * 2 + 3 / 4
# ^ notice that we
# can split the
# statement. In this
# case for readability.
# Usually you shouldn't.
"My big brain math
is $bigBrain"
~~~

`}
      </Markdown>
    </div>
  )
}
