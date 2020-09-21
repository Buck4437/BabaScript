function lexer (code) {
  return code.split(/\s+/)
          .filter(t => t.length > 0)
          .map(function (t) {
                return !isNaN(t) ? {type: 'Number', value: t}
                      : t.charAt(0) === '$' ? {type: 'String', value: t.substring(1)} //temporary
                      : t === t.toUpperCase() ? {type: 'Property', value: t}
                      : t.charAt(0) === t.charAt(0).toUpperCase() ? {type: 'Object', value: t}
                      : {type: 'Operator', value: t}
              })
}

function parser (tokens) {
  var AST = {
    type: 'BABASCRIPT',
    body: []
  }
  // extract a token at a time as current_token. Loop until we are out of tokens.
  while (tokens.length > 0){
    var current_token = tokens.shift()

    if (current_token.type === 'Object') {
      var operator_token = tokens.shift()
      if (operator_token.type === 'Operator') {
        let argument
        switch (operator_token.value){
          case 'is' :
            argument = tokens.shift()
            if (argument.type === 'Property' || argument.type === 'Object' || argument.type === 'Number' || argument.type === 'String') {
              var expression = {
                type: 'Operator',
                name: 'is',
                arguments: []
              }
              expression.arguments.push({  // add argument information to expression object
                type: 'Object',
                value: current_token.value
              })
              expression.arguments.push({  // add argument information to expression object
                type: argument.type,
                value: argument.value
              })
              AST.body.push(expression)    // push the expression object to body of our AST
            } else {
              throw '"is" must be followed by a noun.'
            }
          break;
          case 'add' :
            argument = tokens.shift()
            if (argument.type === 'Object' || argument.type === 'Number' || argument.type === 'String') {
              var expression = {
                type: 'Operator',
                name: 'add',
                arguments: []
              }
              expression.arguments.push({  // add argument information to expression object
                type: 'Object',
                value: current_token.value
              })
              expression.arguments.push({  // add argument information to expression object
                type: argument.type,
                value: argument.value
              })
              AST.body.push(expression)    // push the expression object to body of our AST
            } else {
              throw '"add" must be followed by a noun.'
            }
          break;
          case 'log' :
            argument = tokens.shift()
            if (argument.type === 'Object' || argument.type === 'Number' || argument.type === 'String') {
              var expression = {
                type: 'Command',
                name: 'log',
                arguments: []
              }
              expression.arguments.push({  // add argument information to expression object
                type: 'Object',
                value: current_token.value
              })
              expression.arguments.push({  // add argument information to expression object
                type: argument.type,
                value: argument.value
              })
              AST.body.push(expression)    // push the expression object to body of our AST
            } else {
              throw '"log" must be followed by a noun.'
            }
          break;
        }
      }
      else{
        throw ('An Object must be followed by an Operator')
      }
    }
  }
  return AST
}

function transpiler(ast){
  var vars = {}
  while (ast.body.length > 0) {
    var node = ast.body.shift()
    var args = node.arguments
    switch (node.name) {
      case 'is' :
        if (args[1].type === 'Property'){
          switch (args[1].value){
            case 'NUM':
            case 'NUMBER':
            vars[args[0].value] = 0

            case 'STR':
            case 'STRING':
            vars[args[0].value] = ""
          }
        }
        else if (args[1].type === 'Object'){
          if (vars[args[1].value] !== undefined){
              vars[args[0].value] = vars[args[1].value]
          }
          else{
            throw (`Error: ${args[1].value} is not defined`)
          }
        }
        else if (args[1].type === 'Number'){
          vars[args[0].value] = Number(args[1].value)
        }
        else { //string
          vars[args[0].value] = args[1].value
        }
      break
      case 'add' :
        if (args[1].type === 'Object'){
          if (vars[args[1].value] !== undefined){
              vars[args[0].value] += vars[args[1].value]
          }
          else{
            throw (`Error: ${args[1].value} is not defined`)
          }
        }
        else if (args[1].type === 'Number'){
          vars[args[0].value] += Number(args[1].value)
        }
        else { //string
          vars[args[0].value] += args[1].value
        }
      break
      case 'log' :
        if (args[1].type === 'Object'){
          if (vars[args[1].value] !== undefined){
              console.log(`${args[0].value} log: ${vars[args[1].value]}`)
          }
          else{
            throw (`Error: ${args[1].value} is not defined`)
          }
        }
        else { //string, Number
          console.log(`${args[0].value} log: ${args[1].value}`)
        }
      break
    }
  }
}

function run(str){
  let tokens = lexer(str)
  let ast = parser(tokens)
  transpiler(ast)
}


// window.Baba = (function(){
//   'use strict'
//
//   var Baba = {}
//
//   Baba.run = function(str){
//     let tokens = lexer(str)
//     let tree = parser(tokens)
//     return tree
//   }
//
//   return Baba;
// })()
