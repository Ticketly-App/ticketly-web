/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ticketly.json`.
 */
export type Ticketly = {
    "address": "GawjtcQFx5cnK24VrDiUhGdg4DZbVGLzsSsd4vbxznfs",
    "metadata": {
      "name": "ticketly",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Onchain Luma — tokenised event ticketing on Solana"
    },
    "instructions": [
      {
        "name": "addOperator",
        "docs": [
          "Register a new gate operator wallet (max 10 per event)."
        ],
        "discriminator": [
          149,
          142,
          187,
          68,
          33,
          250,
          87,
          105
        ],
        "accounts": [
          {
            "name": "event",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "event"
            ]
          }
        ],
        "args": [
          {
            "name": "operator",
            "type": "pubkey"
          }
        ]
      },
      {
        "name": "addWhitelistEntry",
        "discriminator": [
          150,
          200,
          2,
          55,
          226,
          43,
          50,
          203
        ],
        "accounts": [
          {
            "name": "event",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "whitelistEntry",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    119,
                    104,
                    105,
                    116,
                    101,
                    108,
                    105,
                    115,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event"
                },
                {
                  "kind": "arg",
                  "path": "wallet"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true,
            "relations": [
              "event"
            ]
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "allocation",
            "type": "u8"
          }
        ]
      },
      {
        "name": "buyTicket",
        "discriminator": [
          11,
          24,
          17,
          193,
          168,
          116,
          164,
          169
        ],
        "accounts": [
          {
            "name": "event",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "ticket",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    116,
                    105,
                    99,
                    107,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket.event",
                  "account": "ticketAccount"
                },
                {
                  "kind": "account",
                  "path": "ticket.ticket_number",
                  "account": "ticketAccount"
                }
              ]
            },
            "relations": [
              "listing"
            ]
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108,
                    105,
                    115,
                    116,
                    105,
                    110,
                    103
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket"
                }
              ]
            }
          },
          {
            "name": "mint"
          },
          {
            "name": "escrowAta",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "listing"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "buyerAta",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "buyer"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "seller",
            "writable": true
          },
          {
            "name": "royaltyReceiver",
            "writable": true
          },
          {
            "name": "buyer",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "cancelEvent",
        "discriminator": [
          55,
          143,
          36,
          45,
          59,
          241,
          89,
          119
        ],
        "accounts": [
          {
            "name": "event",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "event"
            ]
          }
        ],
        "args": []
      },
      {
        "name": "cancelListing",
        "discriminator": [
          41,
          183,
          50,
          232,
          230,
          233,
          157,
          70
        ],
        "accounts": [
          {
            "name": "event",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "ticket",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    116,
                    105,
                    99,
                    107,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket.event",
                  "account": "ticketAccount"
                },
                {
                  "kind": "account",
                  "path": "ticket.ticket_number",
                  "account": "ticketAccount"
                }
              ]
            }
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108,
                    105,
                    115,
                    116,
                    105,
                    110,
                    103
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket"
                }
              ]
            }
          },
          {
            "name": "mint"
          },
          {
            "name": "escrowAta",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "listing"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "sellerAta",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "seller"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "seller",
            "writable": true,
            "signer": true,
            "relations": [
              "listing"
            ]
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "checkInTicket",
        "discriminator": [
          174,
          66,
          18,
          131,
          231,
          120,
          103,
          246
        ],
        "accounts": [
          {
            "name": "event",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "ticket",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    116,
                    105,
                    99,
                    107,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket.event",
                  "account": "ticketAccount"
                },
                {
                  "kind": "account",
                  "path": "ticket.ticket_number",
                  "account": "ticketAccount"
                }
              ]
            }
          },
          {
            "name": "attendeeAta",
            "writable": true
          },
          {
            "name": "metadataAccount",
            "writable": true
          },
          {
            "name": "attendee"
          },
          {
            "name": "gateOperator",
            "signer": true
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "tokenMetadataProgram"
          }
        ],
        "args": []
      },
      {
        "name": "createEvent",
        "discriminator": [
          49,
          219,
          29,
          203,
          22,
          98,
          100,
          87
        ],
        "accounts": [
          {
            "name": "event",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                },
                {
                  "kind": "arg",
                  "path": "params.event_id"
                }
              ]
            }
          },
          {
            "name": "organizerProfile",
            "writable": true,
            "optional": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    111,
                    114,
                    103,
                    97,
                    110,
                    105,
                    122,
                    101,
                    114
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true,
            "relations": [
              "organizerProfile"
            ]
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "params",
            "type": {
              "defined": {
                "name": "createEventParams"
              }
            }
          }
        ]
      },
      {
        "name": "initOrganizer",
        "docs": [
          "Create a persistent OrganizerProfile for cross-event identity & stats."
        ],
        "discriminator": [
          113,
          157,
          225,
          241,
          5,
          198,
          166,
          105
        ],
        "accounts": [
          {
            "name": "organizerProfile",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    111,
                    114,
                    103,
                    97,
                    110,
                    105,
                    122,
                    101,
                    114
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "params",
            "type": {
              "defined": {
                "name": "initOrganizerParams"
              }
            }
          }
        ]
      },
      {
        "name": "initPlatform",
        "discriminator": [
          29,
          22,
          210,
          225,
          219,
          114,
          193,
          169
        ],
        "accounts": [
          {
            "name": "platformConfig",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    108,
                    97,
                    116,
                    102,
                    111,
                    114,
                    109
                  ]
                }
              ]
            }
          },
          {
            "name": "admin",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "protocolFeeBps",
            "type": "u16"
          }
        ]
      },
      {
        "name": "listTicket",
        "discriminator": [
          11,
          213,
          240,
          45,
          246,
          35,
          44,
          162
        ],
        "accounts": [
          {
            "name": "event",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "ticket",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    116,
                    105,
                    99,
                    107,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket.event",
                  "account": "ticketAccount"
                },
                {
                  "kind": "account",
                  "path": "ticket.ticket_number",
                  "account": "ticketAccount"
                }
              ]
            }
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108,
                    105,
                    115,
                    116,
                    105,
                    110,
                    103
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket"
                }
              ]
            }
          },
          {
            "name": "mint"
          },
          {
            "name": "sellerAta",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "seller"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "escrowAta",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "listing"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "seller",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "price",
            "type": "u64"
          }
        ]
      },
      {
        "name": "mintPoap",
        "discriminator": [
          47,
          118,
          93,
          194,
          75,
          192,
          65,
          78
        ],
        "accounts": [
          {
            "name": "event",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "ticket",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    116,
                    105,
                    99,
                    107,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket.event",
                  "account": "ticketAccount"
                },
                {
                  "kind": "account",
                  "path": "ticket.ticket_number",
                  "account": "ticketAccount"
                }
              ]
            }
          },
          {
            "name": "poapRecord",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    111,
                    97,
                    112
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket"
                }
              ]
            }
          },
          {
            "name": "poapMint",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    111,
                    97,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket"
                }
              ]
            }
          },
          {
            "name": "holderAta",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "holder"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "poapMint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "poapMetadataAccount",
            "writable": true
          },
          {
            "name": "holder"
          },
          {
            "name": "payer",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "tokenMetadataProgram"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "mintTicket",
        "discriminator": [
          159,
          167,
          223,
          60,
          138,
          6,
          23,
          29
        ],
        "accounts": [
          {
            "name": "event",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "ticket",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    116,
                    105,
                    99,
                    107,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event"
                },
                {
                  "kind": "account",
                  "path": "event.total_minted",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "mint",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    116,
                    105,
                    99,
                    107,
                    101,
                    116,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket"
                }
              ]
            }
          },
          {
            "name": "recipientAta",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "recipient"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "metadataAccount",
            "writable": true
          },
          {
            "name": "whitelistEntry",
            "writable": true,
            "optional": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    119,
                    104,
                    105,
                    116,
                    101,
                    108,
                    105,
                    115,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event"
                },
                {
                  "kind": "account",
                  "path": "payer"
                }
              ]
            }
          },
          {
            "name": "recipient"
          },
          {
            "name": "payer",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "tokenMetadataProgram"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "params",
            "type": {
              "defined": {
                "name": "mintTicketParams"
              }
            }
          }
        ]
      },
      {
        "name": "removeOperator",
        "discriminator": [
          84,
          183,
          126,
          251,
          137,
          150,
          214,
          134
        ],
        "accounts": [
          {
            "name": "event",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "event"
            ]
          }
        ],
        "args": [
          {
            "name": "operator",
            "type": "pubkey"
          }
        ]
      },
      {
        "name": "removeWhitelistEntry",
        "discriminator": [
          134,
          164,
          192,
          96,
          65,
          236,
          254,
          209
        ],
        "accounts": [
          {
            "name": "event",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "whitelistEntry",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    119,
                    104,
                    105,
                    116,
                    101,
                    108,
                    105,
                    115,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event"
                },
                {
                  "kind": "account",
                  "path": "whitelist_entry.wallet",
                  "account": "whitelistEntry"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true,
            "relations": [
              "event"
            ]
          }
        ],
        "args": []
      },
      {
        "name": "transferTicket",
        "discriminator": [
          191,
          184,
          74,
          239,
          164,
          172,
          188,
          32
        ],
        "accounts": [
          {
            "name": "event",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "ticket",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    116,
                    105,
                    99,
                    107,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "ticket.event",
                  "account": "ticketAccount"
                },
                {
                  "kind": "account",
                  "path": "ticket.ticket_number",
                  "account": "ticketAccount"
                }
              ]
            }
          },
          {
            "name": "mint"
          },
          {
            "name": "senderAta",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "sender"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "recipientAta",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "recipient"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "sender",
            "writable": true,
            "signer": true
          },
          {
            "name": "recipient"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "updateEvent",
        "discriminator": [
          70,
          108,
          211,
          125,
          171,
          176,
          25,
          217
        ],
        "accounts": [
          {
            "name": "event",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "event"
            ]
          }
        ],
        "args": [
          {
            "name": "params",
            "type": {
              "defined": {
                "name": "updateEventParams"
              }
            }
          }
        ]
      },
      {
        "name": "updateOrganizer",
        "discriminator": [
          243,
          26,
          10,
          51,
          155,
          79,
          248,
          89
        ],
        "accounts": [
          {
            "name": "organizerProfile",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    111,
                    114,
                    103,
                    97,
                    110,
                    105,
                    122,
                    101,
                    114
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "organizerProfile"
            ]
          }
        ],
        "args": [
          {
            "name": "params",
            "type": {
              "defined": {
                "name": "initOrganizerParams"
              }
            }
          }
        ]
      },
      {
        "name": "updatePlatform",
        "discriminator": [
          46,
          78,
          138,
          189,
          47,
          163,
          120,
          85
        ],
        "accounts": [
          {
            "name": "platformConfig",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    108,
                    97,
                    116,
                    102,
                    111,
                    114,
                    109
                  ]
                }
              ]
            }
          },
          {
            "name": "admin",
            "signer": true,
            "relations": [
              "platformConfig"
            ]
          }
        ],
        "args": [
          {
            "name": "protocolFeeBps",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "feeReceiver",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "creationPaused",
            "type": {
              "option": "bool"
            }
          }
        ]
      },
      {
        "name": "withdrawRevenue",
        "discriminator": [
          58,
          241,
          152,
          184,
          104,
          150,
          169,
          119
        ],
        "accounts": [
          {
            "name": "event",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101,
                    118,
                    101,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "event.authority",
                  "account": "eventAccount"
                },
                {
                  "kind": "account",
                  "path": "event.event_id",
                  "account": "eventAccount"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true,
            "relations": [
              "event"
            ]
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "eventAccount",
        "discriminator": [
          98,
          136,
          32,
          165,
          133,
          231,
          243,
          154
        ]
      },
      {
        "name": "listingAccount",
        "discriminator": [
          59,
          89,
          136,
          25,
          21,
          196,
          183,
          13
        ]
      },
      {
        "name": "organizerProfile",
        "discriminator": [
          216,
          88,
          24,
          216,
          45,
          218,
          209,
          79
        ]
      },
      {
        "name": "platformConfig",
        "discriminator": [
          160,
          78,
          128,
          0,
          248,
          83,
          230,
          160
        ]
      },
      {
        "name": "poapRecord",
        "discriminator": [
          44,
          75,
          50,
          216,
          240,
          99,
          62,
          107
        ]
      },
      {
        "name": "ticketAccount",
        "discriminator": [
          231,
          93,
          13,
          18,
          239,
          66,
          21,
          45
        ]
      },
      {
        "name": "whitelistEntry",
        "discriminator": [
          51,
          70,
          173,
          81,
          219,
          192,
          234,
          62
        ]
      }
    ],
    "events": [
      {
        "name": "eventCancelled",
        "discriminator": [
          74,
          193,
          21,
          191,
          188,
          43,
          124,
          129
        ]
      },
      {
        "name": "eventCreated",
        "discriminator": [
          59,
          186,
          199,
          175,
          242,
          25,
          238,
          94
        ]
      },
      {
        "name": "eventUpdated",
        "discriminator": [
          238,
          86,
          17,
          103,
          12,
          182,
          141,
          61
        ]
      },
      {
        "name": "listingCancelled",
        "discriminator": [
          11,
          46,
          163,
          10,
          103,
          80,
          139,
          194
        ]
      },
      {
        "name": "operatorAdded",
        "discriminator": [
          216,
          247,
          101,
          54,
          51,
          70,
          215,
          192
        ]
      },
      {
        "name": "operatorRemoved",
        "discriminator": [
          223,
          10,
          131,
          23,
          165,
          154,
          14,
          191
        ]
      },
      {
        "name": "organizerVerified",
        "discriminator": [
          185,
          228,
          73,
          30,
          203,
          58,
          139,
          58
        ]
      },
      {
        "name": "poapMinted",
        "discriminator": [
          212,
          134,
          102,
          94,
          147,
          233,
          99,
          157
        ]
      },
      {
        "name": "revenueWithdrawn",
        "discriminator": [
          218,
          28,
          88,
          7,
          95,
          50,
          36,
          103
        ]
      },
      {
        "name": "ticketCheckedIn",
        "discriminator": [
          189,
          153,
          33,
          70,
          49,
          155,
          13,
          212
        ]
      },
      {
        "name": "ticketListed",
        "discriminator": [
          104,
          201,
          254,
          122,
          120,
          162,
          118,
          153
        ]
      },
      {
        "name": "ticketMinted",
        "discriminator": [
          22,
          17,
          212,
          38,
          91,
          144,
          104,
          109
        ]
      },
      {
        "name": "ticketSold",
        "discriminator": [
          201,
          47,
          13,
          10,
          92,
          172,
          222,
          219
        ]
      },
      {
        "name": "ticketTransferred",
        "discriminator": [
          24,
          154,
          61,
          145,
          95,
          79,
          109,
          70
        ]
      },
      {
        "name": "whitelistEntryAdded",
        "discriminator": [
          211,
          222,
          181,
          247,
          213,
          104,
          195,
          55
        ]
      },
      {
        "name": "whitelistEntryRemoved",
        "discriminator": [
          201,
          49,
          12,
          250,
          229,
          150,
          219,
          181
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "nameTooLong",
        "msg": "Event name exceeds 50 characters"
      },
      {
        "code": 6001,
        "name": "descriptionTooLong",
        "msg": "Description exceeds 200 characters"
      },
      {
        "code": 6002,
        "name": "venueTooLong",
        "msg": "Venue string exceeds 100 characters"
      },
      {
        "code": 6003,
        "name": "uriTooLong",
        "msg": "Metadata URI exceeds 200 characters"
      },
      {
        "code": 6004,
        "name": "symbolTooLong",
        "msg": "Symbol exceeds 10 characters"
      },
      {
        "code": 6005,
        "name": "invalidTierCount",
        "msg": "Must define 1-5 ticket tiers"
      },
      {
        "code": 6006,
        "name": "invalidSupply",
        "msg": "Tier supply must be at least 1"
      },
      {
        "code": 6007,
        "name": "invalidPrice",
        "msg": "Ticket price must be ≥ 0 lamports"
      },
      {
        "code": 6008,
        "name": "invalidRoyalty",
        "msg": "Royalty basis-points must be ≤ 2 000 (20 %)"
      },
      {
        "code": 6009,
        "name": "startInPast",
        "msg": "event_start must be in the future"
      },
      {
        "code": 6010,
        "name": "endBeforeStart",
        "msg": "event_end must be after event_start"
      },
      {
        "code": 6011,
        "name": "eventNotActive",
        "msg": "Event is not active"
      },
      {
        "code": 6012,
        "name": "eventEnded",
        "msg": "Event has already ended"
      },
      {
        "code": 6013,
        "name": "checkInTooEarly",
        "msg": "Check-in opens 1 hour before event start"
      },
      {
        "code": 6014,
        "name": "eventAlreadyCancelled",
        "msg": "Event is already cancelled"
      },
      {
        "code": 6015,
        "name": "cannotCancelAfterCheckIn",
        "msg": "Cannot cancel: at least one attendee has already checked in"
      },
      {
        "code": 6016,
        "name": "tierSoldOut",
        "msg": "This tier is sold out"
      },
      {
        "code": 6017,
        "name": "invalidTierIndex",
        "msg": "Tier index out of bounds"
      },
      {
        "code": 6018,
        "name": "tierNotOnSale",
        "msg": "This tier is not currently on sale"
      },
      {
        "code": 6019,
        "name": "tierSaleNotStarted",
        "msg": "Tier sale has not started yet"
      },
      {
        "code": 6020,
        "name": "tierSaleEnded",
        "msg": "Tier sale window has ended"
      },
      {
        "code": 6021,
        "name": "alreadyCheckedIn",
        "msg": "Ticket has already been checked in"
      },
      {
        "code": 6022,
        "name": "notCheckedIn",
        "msg": "Ticket has not been checked in yet"
      },
      {
        "code": 6023,
        "name": "ticketEventMismatch",
        "msg": "Ticket does not belong to this event"
      },
      {
        "code": 6024,
        "name": "notTicketOwner",
        "msg": "Caller does not own this ticket"
      },
      {
        "code": 6025,
        "name": "ticketIsListed",
        "msg": "Ticket is currently listed for resale — cancel listing first"
      },
      {
        "code": 6026,
        "name": "ticketNotListed",
        "msg": "Ticket is not listed for resale"
      },
      {
        "code": 6027,
        "name": "mintMismatch",
        "msg": "Token mint does not match ticket record"
      },
      {
        "code": 6028,
        "name": "zeroBalance",
        "msg": "Token account has zero balance"
      },
      {
        "code": 6029,
        "name": "tokenOwnerMismatch",
        "msg": "Token account authority mismatch"
      },
      {
        "code": 6030,
        "name": "resaleNotAllowed",
        "msg": "Resale is not enabled for this event"
      },
      {
        "code": 6031,
        "name": "priceExceedsCap",
        "msg": "Listing price exceeds the event resale price cap"
      },
      {
        "code": 6032,
        "name": "buyerIsOwner",
        "msg": "Buyer is already the owner of this ticket"
      },
      {
        "code": 6033,
        "name": "poapNotEnabled",
        "msg": "POAP minting is not enabled for this event"
      },
      {
        "code": 6034,
        "name": "poapAlreadyMinted",
        "msg": "A POAP has already been minted for this ticket"
      },
      {
        "code": 6035,
        "name": "whitelistEntryRequired",
        "msg": "This event requires a whitelist entry to purchase"
      },
      {
        "code": 6036,
        "name": "whitelistEventMismatch",
        "msg": "Whitelist entry belongs to a different event"
      },
      {
        "code": 6037,
        "name": "notWhitelisted",
        "msg": "Caller is not on the whitelist for this event"
      },
      {
        "code": 6038,
        "name": "allocationExhausted",
        "msg": "Whitelist allocation fully used"
      },
      {
        "code": 6039,
        "name": "whitelistNotEnabled",
        "msg": "Whitelist gating is not enabled for this event"
      },
      {
        "code": 6040,
        "name": "notEventAuthority",
        "msg": "Signer is not the event authority"
      },
      {
        "code": 6041,
        "name": "notGateOperator",
        "msg": "Signer is not an authorised gate operator"
      },
      {
        "code": 6042,
        "name": "operatorAlreadyAdded",
        "msg": "Gate operator is already registered"
      },
      {
        "code": 6043,
        "name": "operatorNotFound",
        "msg": "Gate operator not found"
      },
      {
        "code": 6044,
        "name": "tooManyOperators",
        "msg": "Max gate operators reached (10)"
      },
      {
        "code": 6045,
        "name": "nothingToWithdraw",
        "msg": "No withdrawable balance in event PDA"
      },
      {
        "code": 6046,
        "name": "insufficientFunds",
        "msg": "Requested withdrawal exceeds available balance"
      },
      {
        "code": 6047,
        "name": "overflow",
        "msg": "Arithmetic overflow or underflow"
      }
    ],
    "types": [
      {
        "name": "createEventParams",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventId",
              "type": "u64"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "description",
              "type": "string"
            },
            {
              "name": "venue",
              "type": "string"
            },
            {
              "name": "metadataUri",
              "type": "string"
            },
            {
              "name": "symbol",
              "type": "string"
            },
            {
              "name": "gps",
              "type": {
                "defined": {
                  "name": "gpsCoords"
                }
              }
            },
            {
              "name": "eventStart",
              "type": "i64"
            },
            {
              "name": "eventEnd",
              "type": "i64"
            },
            {
              "name": "ticketTiers",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ticketTier"
                  }
                }
              }
            },
            {
              "name": "resaleAllowed",
              "type": "bool"
            },
            {
              "name": "maxResalePrice",
              "type": {
                "option": "u64"
              }
            },
            {
              "name": "royaltyBps",
              "type": "u16"
            },
            {
              "name": "whitelistGated",
              "type": "bool"
            },
            {
              "name": "poapEnabled",
              "type": "bool"
            },
            {
              "name": "poapMetadataUri",
              "type": "string"
            }
          ]
        }
      },
      {
        "name": "eventAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "eventId",
              "type": "u64"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "description",
              "type": "string"
            },
            {
              "name": "venue",
              "type": "string"
            },
            {
              "name": "metadataUri",
              "type": "string"
            },
            {
              "name": "symbol",
              "type": "string"
            },
            {
              "name": "gps",
              "type": {
                "defined": {
                  "name": "gpsCoords"
                }
              }
            },
            {
              "name": "eventStart",
              "type": "i64"
            },
            {
              "name": "eventEnd",
              "type": "i64"
            },
            {
              "name": "createdAt",
              "type": "i64"
            },
            {
              "name": "ticketTiers",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ticketTier"
                  }
                }
              }
            },
            {
              "name": "totalMinted",
              "type": "u64"
            },
            {
              "name": "totalCheckedIn",
              "type": "u64"
            },
            {
              "name": "totalRevenue",
              "type": "u64"
            },
            {
              "name": "resaleAllowed",
              "type": "bool"
            },
            {
              "name": "maxResalePrice",
              "type": {
                "option": "u64"
              }
            },
            {
              "name": "royaltyBps",
              "type": "u16"
            },
            {
              "name": "royaltyReceiver",
              "type": "pubkey"
            },
            {
              "name": "totalRoyalties",
              "type": "u64"
            },
            {
              "name": "gateOperators",
              "type": {
                "vec": "pubkey"
              }
            },
            {
              "name": "whitelistGated",
              "type": "bool"
            },
            {
              "name": "poapEnabled",
              "type": "bool"
            },
            {
              "name": "poapMetadataUri",
              "type": "string"
            },
            {
              "name": "totalPoapsMinted",
              "type": "u64"
            },
            {
              "name": "isActive",
              "type": "bool"
            },
            {
              "name": "isCancelled",
              "type": "bool"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "eventCancelled",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "eventCreated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "eventId",
              "type": "u64"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "eventStart",
              "type": "i64"
            },
            {
              "name": "eventEnd",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "eventUpdated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "gpsCoords",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "latMicro",
              "type": "i32"
            },
            {
              "name": "lngMicro",
              "type": "i32"
            }
          ]
        }
      },
      {
        "name": "initOrganizerParams",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "website",
              "type": "string"
            },
            {
              "name": "logoUri",
              "type": "string"
            }
          ]
        }
      },
      {
        "name": "listingAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "event",
              "type": "pubkey"
            },
            {
              "name": "ticket",
              "type": "pubkey"
            },
            {
              "name": "seller",
              "type": "pubkey"
            },
            {
              "name": "escrowAta",
              "type": "pubkey"
            },
            {
              "name": "price",
              "type": "u64"
            },
            {
              "name": "listedAt",
              "type": "i64"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "listingCancelled",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "ticketPda",
              "type": "pubkey"
            },
            {
              "name": "seller",
              "type": "pubkey"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "mintTicketParams",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "tierIndex",
              "type": "u8"
            },
            {
              "name": "metadataUri",
              "type": "string"
            }
          ]
        }
      },
      {
        "name": "operatorAdded",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "operator",
              "type": "pubkey"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "operatorRemoved",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "operator",
              "type": "pubkey"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "organizerProfile",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "website",
              "type": "string"
            },
            {
              "name": "logoUri",
              "type": "string"
            },
            {
              "name": "totalEvents",
              "type": "u32"
            },
            {
              "name": "totalTickets",
              "type": "u64"
            },
            {
              "name": "totalRevenue",
              "type": "u64"
            },
            {
              "name": "totalRoyalties",
              "type": "u64"
            },
            {
              "name": "isVerified",
              "type": "bool"
            },
            {
              "name": "createdAt",
              "type": "i64"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "organizerVerified",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "organizerPda",
              "type": "pubkey"
            },
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "platformConfig",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "admin",
              "type": "pubkey"
            },
            {
              "name": "protocolFeeBps",
              "type": "u16"
            },
            {
              "name": "feeReceiver",
              "type": "pubkey"
            },
            {
              "name": "creationPaused",
              "type": "bool"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "poapMinted",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "ticketPda",
              "type": "pubkey"
            },
            {
              "name": "poapPda",
              "type": "pubkey"
            },
            {
              "name": "holder",
              "type": "pubkey"
            },
            {
              "name": "editionNumber",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "poapRecord",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "ticket",
              "type": "pubkey"
            },
            {
              "name": "event",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "holder",
              "type": "pubkey"
            },
            {
              "name": "eventName",
              "type": "string"
            },
            {
              "name": "attendedAt",
              "type": "i64"
            },
            {
              "name": "editionNumber",
              "type": "u64"
            },
            {
              "name": "metadataUri",
              "type": "string"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "revenueWithdrawn",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "ticketAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "event",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "owner",
              "type": "pubkey"
            },
            {
              "name": "originalBuyer",
              "type": "pubkey"
            },
            {
              "name": "ticketNumber",
              "type": "u64"
            },
            {
              "name": "tierIndex",
              "type": "u8"
            },
            {
              "name": "tierType",
              "type": {
                "defined": {
                  "name": "tierType"
                }
              }
            },
            {
              "name": "pricePaid",
              "type": "u64"
            },
            {
              "name": "metadataUri",
              "type": "string"
            },
            {
              "name": "isCheckedIn",
              "type": "bool"
            },
            {
              "name": "checkedInAt",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "checkedInBy",
              "type": {
                "option": "pubkey"
              }
            },
            {
              "name": "poapMinted",
              "type": "bool"
            },
            {
              "name": "isListed",
              "type": "bool"
            },
            {
              "name": "listedPrice",
              "type": {
                "option": "u64"
              }
            },
            {
              "name": "resaleCount",
              "type": "u8"
            },
            {
              "name": "transferCount",
              "type": "u8"
            },
            {
              "name": "mintedAt",
              "type": "i64"
            },
            {
              "name": "lastTransferredAt",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "ticketCheckedIn",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "ticketPda",
              "type": "pubkey"
            },
            {
              "name": "attendee",
              "type": "pubkey"
            },
            {
              "name": "operator",
              "type": "pubkey"
            },
            {   
              "name": "ticketNumber",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "ticketListed",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "ticketPda",
              "type": "pubkey"
            },
            {
              "name": "seller",
              "type": "pubkey"
            },
            {
              "name": "price",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "ticketMinted",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "ticketPda",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "owner",
              "type": "pubkey"
            },
            {
              "name": "ticketNumber",
              "type": "u64"
            },
            {
              "name": "tierIndex",
              "type": "u8"
            },
            {
              "name": "paidLamports",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "ticketSold",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "ticketPda",
              "type": "pubkey"
            },
            {
              "name": "seller",
              "type": "pubkey"
            },
            {
              "name": "buyer",
              "type": "pubkey"
            },
            {
              "name": "price",
              "type": "u64"
            },
            {
              "name": "royaltyLamports",
              "type": "u64"
            },
            {
              "name": "resaleCount",
              "type": "u8"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "ticketTier",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "tierType",
              "type": {
                "defined": {
                  "name": "tierType"
                }
              }
            },
            {
              "name": "price",
              "type": "u64"
            },
            {
              "name": "supply",
              "type": "u32"
            },
            {
              "name": "minted",
              "type": "u32"
            },
            {
              "name": "checkedIn",
              "type": "u32"
            },
            {
              "name": "isOnSale",
              "type": "bool"
            },
            {
              "name": "saleStart",
              "type": "i64"
            },
            {
              "name": "saleEnd",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "ticketTransferred",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "ticketPda",
              "type": "pubkey"
            },
            {
              "name": "from",
              "type": "pubkey"
            },
            {
              "name": "to",
              "type": "pubkey"
            },
            {
              "name": "ticketNumber",
              "type": "u64"
            },
            {
              "name": "transferCount",
              "type": "u8"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "tierType",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "generalAdmission"
            },
            {
              "name": "earlyBird"
            },
            {
              "name": "vip"
            },
            {
              "name": "vvip"
            },
            {
              "name": "custom"
            }
          ]
        }
      },
      {
        "name": "updateEventParams",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "name",
              "type": {
                "option": "string"
              }
            },
            {
              "name": "description",
              "type": {
                "option": "string"
              }
            },
            {
              "name": "venue",
              "type": {
                "option": "string"
              }
            },
            {
              "name": "metadataUri",
              "type": {
                "option": "string"
              }
            },
            {
              "name": "eventStart",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "eventEnd",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "resaleAllowed",
              "type": {
                "option": "bool"
              }
            },
            {
              "name": "maxResalePrice",
              "type": {
                "option": {
                  "option": "u64"
                }
              }
            },
            {
              "name": "royaltyBps",
              "type": {
                "option": "u16"
              }
            }
          ]
        }
      },
      {
        "name": "whitelistEntry",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "event",
              "type": "pubkey"
            },
            {
              "name": "wallet",
              "type": "pubkey"
            },
            {
              "name": "allocation",
              "type": "u8"
            },
            {
              "name": "purchased",
              "type": "u8"
            },
            {
              "name": "addedAt",
              "type": "i64"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "whitelistEntryAdded",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "wallet",
              "type": "pubkey"
            },
            {
              "name": "allocation",
              "type": "u8"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "whitelistEntryRemoved",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "eventPda",
              "type": "pubkey"
            },
            {
              "name": "wallet",
              "type": "pubkey"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      }
    ]
  };
  