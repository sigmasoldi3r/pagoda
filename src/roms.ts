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
  add 1 to hunger
}

section riverActions {
  if hp <= 0 {
    "You've died!"
    return 0
  }
  if hunger >= 10 {
    add -1 to hp
  }
  clear
  "You're standing next to a big _river_.

  | Attribute|Value|
  | :---        |  ---:|
  | food      | $food |
  | hunger   | $hunger |
  | health   | $hp |

- $food of food
- $hunger of hunger
- $hp of health"
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
      add 1 to food
      "Your inventory contains now $food of food."
      wait
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
        add -1 to hunger
        add -1 to food
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
