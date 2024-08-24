#! /bin/bash
ast-grep -p 'return {
                                               $$$A,
                                               $$$B: {
                                                   $$$E,
                                                   filter: { $$$ },
                                                   $$$D
                                               },
                                               $$$C

                                           }
                                           ' -l ts > result.log

