/*
  Some builtin ROMs
*/
import { Rom } from './lib/storage/Rom'

export const testing = new Rom()
testing.baseURL = 'http://localhost:3000'
testing.scripts['init.pag'] = `
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
  }
  if Hunger >= 10 {
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
      "You gather some food."
      add 1 to Food
      "Your inventory contains now $Food of food."
      wait
    }
    "Eat something" {
      if Food <= 0 {
        "You can't eat! You don't have any food..."
      }
      if Hunger <= 0 {
        "You're not hungry right now..."
      }
      if Food > 0 and Hunger > 0 {
        add -1 to Hunger
        add -1 to Food
        "You ate some food..."
      }
      wait
    }
    "Stay" {
      "Some time passes..."
      wait
      call walk
    }
  }
  call riverActions
}

# This is the entry point!
call riverActions
`
