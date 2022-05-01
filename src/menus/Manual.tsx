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

### Dialogues and flow

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

    `}
      </Markdown>
    </div>
  )
}
