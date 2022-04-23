/*
  Some builtin ROMs
*/
import { Rom } from './lib/storage/Rom'

export const testing = new Rom()
testing.baseURL = 'http://localhost:3000'
testing.scripts['init.pag'] = `
set hp to 10
set hunger to 0
set food to 0

section walk {
  set hunger to hunger + 1
}

section riverActions {
  if hp <= 0 {
    "You've died!"
    return 0
  }
  if hunger >= 10 {
    set hp to hp - 1
  }
  clear
  "You're standing next to a river"
  " - $food of food"
  " - $hunger of hunger"
  " - $hp of health"
  choice "Actions" {
    "Go up the river" {
      call walk
      "Not ready"
    }
    "Go down the river" {
      call walk
      "Not ready"
    }
    "Gather" {
      "You gather some food."
      set food to food + 1
      "Your inventory contains now $food of food."
      call riverActions
    }
    "Eat something" {
      if food <= 0 {
        "You can't eat! You don't have any food..."
      }
      if hunger <= 0 {
        "You're not hungry right now..."
      }
      if food > 0 and hunger > 0 {
        set food to food - 1
        set hunger to hunger - 1
        "You ate some food..."
      }
      wait
      call riverActions
    }
    "Stay" {
      "Some time passes..."
      wait
      call walk
      call riverActions
    }
  }
}

# This is the entry point!
call riverActions
`
