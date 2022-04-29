/*
  Some builtin ROMs, generated from build script at Fri Apr 29 2022 13:20:58 GMT+0200 (hora de verano de Europa central)
*/
import { Rom } from './lib/storage/Rom'

export const Survivors = new Rom()
Survivors.meta = {"name":"Survivors","author":"sigmasoldi3r","desc":"A survival game in natural environments","site":"http://github.com/sigmasoldi3r","version":"1.0.0","extra":{"test":"Yay! I'm a test variable!"},"manifest":{"storage":"save"}}
Survivors.scripts['init'] = `###
# Example project: Survivors
# A simple survival game about wandering in
# a forest of an alien planet.
###
set Health to 10
set Hunger to 0
set Food to 0
set HUNGER_UP_COST to 6
set HUNGER_DOWN_COST to 2
set Pos to 0

section walk {
  add 1 to Hunger
}

section formattedLoc {
  if Pos = 0 {
    return ""
  }
  set Where to "down"
  set LPos to -Pos
  if Pos > 0 {
    set LPos to Pos
    set Where to "up"
  }
  return "You've walked $(LPos * 4) kilometers **$Where** the river."
}

section riverActions {
  if Health <= 0 {
    "You've died!"
    wait
    return nothing
  } else if Hunger >= 10 {
    "The hunger is killing you..."
    wait
    add -1 to Health
  }
  clear
  "You're standing next to a big river. $(call formattedLoc)
- $Food of food
- $Hunger of hunger
- $Health of health"
  choice "Actions" {
    "Go up the river" {
      choice "This costs you $HUNGER_UP_COST of hunger, proceed?" {
        "Yes" {
          "You walk for an hour or so."
          add 1 to Pos
          wait
          add HUNGER_UP_COST to Hunger
        }
        "No" {}
      }
    }
    "Go down the river" {
      choice "This costs you $HUNGER_DOWN_COST of hunger, proceed?" {
        "Yes" {
          "You walk for half an hour or so."
          add -1 to Pos
          wait
          add HUNGER_DOWN_COST to Hunger
        }
        "No" {}
      }
    }
    "Gather" {
      "You've been looking around for some time,"
      set Found to one of [1 :avocados] [2 :eggs] [4 "a rabbit"] [0 :nothing]
      "you've found $(Found's 2nd)!"
      if Found's 1st > 0 {
        "This will procure you with $(Found's 1st) of food."
      }
      add Found's 1st to Food
      "Your inventory contains now $Food of food."
      wait
    }
    "Eat something" {
      if Food <= 0 {
        "You can't eat! You don't have any food..."
      } else if Hunger <= 0 {
        "You're not hungry right now..."
      } else if Food > 0 and Hunger > 0 {
        choice "How much?" {
          "Just one" {
            add -1 to Hunger
            add -1 to Food
            "You've eaten some food..."
          }
          "As much as I can" {
            if Food > Hunger {
              "You've eaten until you've felt satisfied"
              set Food to Food - Hunger
              set Hunger to 0
            } else {
              "You've eaten until there was nothing left"
              set Hunger to Hunger - Food
              set Food to 0
            }
          }
        }
      }
      wait
    }
    "Stay" {
      "Some time passes..."
      wait
      if Health < 10 and Hunger < 10 {
        "You feel a little bit rested"
        add 1 to Health
        wait
      }
      call walk
    }
  }
  call riverActions
}

# This is the entry point!
call riverActions
`


