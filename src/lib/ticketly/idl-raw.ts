export const TICKETLY_IDL = {
  "address": "GawjtcQFx5cnK24VrDiUhGdg4DZbVGLzsSsd4vbxznfs",
  "metadata": {
    "name": "ticketly",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Onchain Luma — tokenised event ticketing on Solana"
  },
  "instructions": [
    {
      "name": "add_operator",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
      "name": "add_whitelist_entry",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
              }
            ]
          }
        },
        {
          "name": "whitelist_entry",
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
          "name": "system_program",
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
      "name": "buy_ticket",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
                "account": "TicketAccount"
              },
              {
                "kind": "account",
                "path": "ticket.ticket_number",
                "account": "TicketAccount"
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
          "name": "escrow_ata",
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
          "name": "buyer_ata",
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
          "name": "royalty_receiver",
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
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
      "name": "cancel_event",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
      "name": "cancel_listing",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
                "account": "TicketAccount"
              },
              {
                "kind": "account",
                "path": "ticket.ticket_number",
                "account": "TicketAccount"
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
          "name": "escrow_ata",
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
          "name": "seller_ata",
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
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
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
      "name": "check_in_ticket",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
                "account": "TicketAccount"
              },
              {
                "kind": "account",
                "path": "ticket.ticket_number",
                "account": "TicketAccount"
              }
            ]
          }
        },
        {
          "name": "attendee_ata",
          "writable": true
        },
        {
          "name": "metadata_account",
          "writable": true
        },
        {
          "name": "attendee"
        },
        {
          "name": "gate_operator",
          "signer": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token_metadata_program"
        }
      ],
      "args": []
    },
    {
      "name": "create_event",
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
          "name": "organizer_profile",
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
            "organizer_profile"
          ]
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "CreateEventParams"
            }
          }
        }
      ]
    },
    {
      "name": "init_organizer",
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
          "name": "organizer_profile",
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
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "InitOrganizerParams"
            }
          }
        }
      ]
    },
    {
      "name": "init_platform",
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
          "name": "platform_config",
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
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "protocol_fee_bps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "list_ticket",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
                "account": "TicketAccount"
              },
              {
                "kind": "account",
                "path": "ticket.ticket_number",
                "account": "TicketAccount"
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
          "name": "seller_ata",
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
          "name": "escrow_ata",
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
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
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
      "name": "mint_poap",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
                "account": "TicketAccount"
              },
              {
                "kind": "account",
                "path": "ticket.ticket_number",
                "account": "TicketAccount"
              }
            ]
          }
        },
        {
          "name": "poap_record",
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
          "name": "poap_mint",
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
          "name": "holder_ata",
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
                "path": "poap_mint"
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
          "name": "poap_metadata_account",
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
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "token_metadata_program"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "mint_ticket",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
                "account": "EventAccount"
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
          "name": "recipient_ata",
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
          "name": "metadata_account",
          "writable": true
        },
        {
          "name": "whitelist_entry",
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
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "token_metadata_program"
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
              "name": "MintTicketParams"
            }
          }
        }
      ]
    },
    {
      "name": "remove_operator",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
      "name": "remove_whitelist_entry",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
              }
            ]
          }
        },
        {
          "name": "whitelist_entry",
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
                "account": "WhitelistEntry"
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
      "name": "transfer_ticket",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
                "account": "TicketAccount"
              },
              {
                "kind": "account",
                "path": "ticket.ticket_number",
                "account": "TicketAccount"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "sender_ata",
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
          "name": "recipient_ata",
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
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
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
      "name": "update_event",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
              "name": "UpdateEventParams"
            }
          }
        }
      ]
    },
    {
      "name": "update_organizer",
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
          "name": "organizer_profile",
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
            "organizer_profile"
          ]
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "InitOrganizerParams"
            }
          }
        }
      ]
    },
    {
      "name": "update_platform",
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
          "name": "platform_config",
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
            "platform_config"
          ]
        }
      ],
      "args": [
        {
          "name": "protocol_fee_bps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "fee_receiver",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "creation_paused",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "withdraw_revenue",
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
                "account": "EventAccount"
              },
              {
                "kind": "account",
                "path": "event.event_id",
                "account": "EventAccount"
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
      "name": "EventAccount",
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
      "name": "ListingAccount",
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
      "name": "OrganizerProfile",
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
      "name": "PlatformConfig",
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
      "name": "PoapRecord",
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
      "name": "TicketAccount",
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
      "name": "WhitelistEntry",
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
      "name": "EventCancelled",
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
      "name": "EventCreated",
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
      "name": "EventUpdated",
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
      "name": "ListingCancelled",
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
      "name": "OperatorAdded",
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
      "name": "OperatorRemoved",
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
      "name": "OrganizerVerified",
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
      "name": "PoapMinted",
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
      "name": "RevenueWithdrawn",
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
      "name": "TicketCheckedIn",
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
      "name": "TicketListed",
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
      "name": "TicketMinted",
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
      "name": "TicketSold",
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
      "name": "TicketTransferred",
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
      "name": "WhitelistEntryAdded",
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
      "name": "WhitelistEntryRemoved",
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
      "name": "NameTooLong",
      "msg": "Event name exceeds 50 characters"
    },
    {
      "code": 6001,
      "name": "DescriptionTooLong",
      "msg": "Description exceeds 200 characters"
    },
    {
      "code": 6002,
      "name": "VenueTooLong",
      "msg": "Venue string exceeds 100 characters"
    },
    {
      "code": 6003,
      "name": "UriTooLong",
      "msg": "Metadata URI exceeds 200 characters"
    },
    {
      "code": 6004,
      "name": "SymbolTooLong",
      "msg": "Symbol exceeds 10 characters"
    },
    {
      "code": 6005,
      "name": "InvalidTierCount",
      "msg": "Must define 1-5 ticket tiers"
    },
    {
      "code": 6006,
      "name": "InvalidSupply",
      "msg": "Tier supply must be at least 1"
    },
    {
      "code": 6007,
      "name": "InvalidPrice",
      "msg": "Ticket price must be ≥ 0 lamports"
    },
    {
      "code": 6008,
      "name": "InvalidRoyalty",
      "msg": "Royalty basis-points must be ≤ 2 000 (20 %)"
    },
    {
      "code": 6009,
      "name": "StartInPast",
      "msg": "event_start must be in the future"
    },
    {
      "code": 6010,
      "name": "EndBeforeStart",
      "msg": "event_end must be after event_start"
    },
    {
      "code": 6011,
      "name": "EventNotActive",
      "msg": "Event is not active"
    },
    {
      "code": 6012,
      "name": "EventEnded",
      "msg": "Event has already ended"
    },
    {
      "code": 6013,
      "name": "CheckInTooEarly",
      "msg": "Check-in opens 1 hour before event start"
    },
    {
      "code": 6014,
      "name": "EventAlreadyCancelled",
      "msg": "Event is already cancelled"
    },
    {
      "code": 6015,
      "name": "CannotCancelAfterCheckIn",
      "msg": "Cannot cancel: at least one attendee has already checked in"
    },
    {
      "code": 6016,
      "name": "TierSoldOut",
      "msg": "This tier is sold out"
    },
    {
      "code": 6017,
      "name": "InvalidTierIndex",
      "msg": "Tier index out of bounds"
    },
    {
      "code": 6018,
      "name": "TierNotOnSale",
      "msg": "This tier is not currently on sale"
    },
    {
      "code": 6019,
      "name": "TierSaleNotStarted",
      "msg": "Tier sale has not started yet"
    },
    {
      "code": 6020,
      "name": "TierSaleEnded",
      "msg": "Tier sale window has ended"
    },
    {
      "code": 6021,
      "name": "AlreadyCheckedIn",
      "msg": "Ticket has already been checked in"
    },
    {
      "code": 6022,
      "name": "NotCheckedIn",
      "msg": "Ticket has not been checked in yet"
    },
    {
      "code": 6023,
      "name": "TicketEventMismatch",
      "msg": "Ticket does not belong to this event"
    },
    {
      "code": 6024,
      "name": "NotTicketOwner",
      "msg": "Caller does not own this ticket"
    },
    {
      "code": 6025,
      "name": "TicketIsListed",
      "msg": "Ticket is currently listed for resale — cancel listing first"
    },
    {
      "code": 6026,
      "name": "TicketNotListed",
      "msg": "Ticket is not listed for resale"
    },
    {
      "code": 6027,
      "name": "MintMismatch",
      "msg": "Token mint does not match ticket record"
    },
    {
      "code": 6028,
      "name": "ZeroBalance",
      "msg": "Token account has zero balance"
    },
    {
      "code": 6029,
      "name": "TokenOwnerMismatch",
      "msg": "Token account authority mismatch"
    },
    {
      "code": 6030,
      "name": "ResaleNotAllowed",
      "msg": "Resale is not enabled for this event"
    },
    {
      "code": 6031,
      "name": "PriceExceedsCap",
      "msg": "Listing price exceeds the event resale price cap"
    },
    {
      "code": 6032,
      "name": "BuyerIsOwner",
      "msg": "Buyer is already the owner of this ticket"
    },
    {
      "code": 6033,
      "name": "PoapNotEnabled",
      "msg": "POAP minting is not enabled for this event"
    },
    {
      "code": 6034,
      "name": "PoapAlreadyMinted",
      "msg": "A POAP has already been minted for this ticket"
    },
    {
      "code": 6035,
      "name": "WhitelistEntryRequired",
      "msg": "This event requires a whitelist entry to purchase"
    },
    {
      "code": 6036,
      "name": "WhitelistEventMismatch",
      "msg": "Whitelist entry belongs to a different event"
    },
    {
      "code": 6037,
      "name": "NotWhitelisted",
      "msg": "Caller is not on the whitelist for this event"
    },
    {
      "code": 6038,
      "name": "AllocationExhausted",
      "msg": "Whitelist allocation fully used"
    },
    {
      "code": 6039,
      "name": "WhitelistNotEnabled",
      "msg": "Whitelist gating is not enabled for this event"
    },
    {
      "code": 6040,
      "name": "NotEventAuthority",
      "msg": "Signer is not the event authority"
    },
    {
      "code": 6041,
      "name": "NotGateOperator",
      "msg": "Signer is not an authorised gate operator"
    },
    {
      "code": 6042,
      "name": "OperatorAlreadyAdded",
      "msg": "Gate operator is already registered"
    },
    {
      "code": 6043,
      "name": "OperatorNotFound",
      "msg": "Gate operator not found"
    },
    {
      "code": 6044,
      "name": "TooManyOperators",
      "msg": "Max gate operators reached (10)"
    },
    {
      "code": 6045,
      "name": "NothingToWithdraw",
      "msg": "No withdrawable balance in event PDA"
    },
    {
      "code": 6046,
      "name": "InsufficientFunds",
      "msg": "Requested withdrawal exceeds available balance"
    },
    {
      "code": 6047,
      "name": "Overflow",
      "msg": "Arithmetic overflow or underflow"
    }
  ],
  "types": [
    {
      "name": "CreateEventParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_id",
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
            "name": "metadata_uri",
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
                "name": "GpsCoords"
              }
            }
          },
          {
            "name": "event_start",
            "type": "i64"
          },
          {
            "name": "event_end",
            "type": "i64"
          },
          {
            "name": "ticket_tiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "TicketTier"
                }
              }
            }
          },
          {
            "name": "resale_allowed",
            "type": "bool"
          },
          {
            "name": "max_resale_price",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "royalty_bps",
            "type": "u16"
          },
          {
            "name": "whitelist_gated",
            "type": "bool"
          },
          {
            "name": "poap_enabled",
            "type": "bool"
          },
          {
            "name": "poap_metadata_uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "EventAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "event_id",
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
            "name": "metadata_uri",
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
                "name": "GpsCoords"
              }
            }
          },
          {
            "name": "event_start",
            "type": "i64"
          },
          {
            "name": "event_end",
            "type": "i64"
          },
          {
            "name": "created_at",
            "type": "i64"
          },
          {
            "name": "ticket_tiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "TicketTier"
                }
              }
            }
          },
          {
            "name": "total_minted",
            "type": "u64"
          },
          {
            "name": "total_checked_in",
            "type": "u64"
          },
          {
            "name": "total_revenue",
            "type": "u64"
          },
          {
            "name": "resale_allowed",
            "type": "bool"
          },
          {
            "name": "max_resale_price",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "royalty_bps",
            "type": "u16"
          },
          {
            "name": "royalty_receiver",
            "type": "pubkey"
          },
          {
            "name": "total_royalties",
            "type": "u64"
          },
          {
            "name": "gate_operators",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "whitelist_gated",
            "type": "bool"
          },
          {
            "name": "poap_enabled",
            "type": "bool"
          },
          {
            "name": "poap_metadata_uri",
            "type": "string"
          },
          {
            "name": "total_poaps_minted",
            "type": "u64"
          },
          {
            "name": "is_active",
            "type": "bool"
          },
          {
            "name": "is_cancelled",
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
      "name": "EventCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
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
      "name": "EventCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "event_pda",
            "type": "pubkey"
          },
          {
            "name": "event_id",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "event_start",
            "type": "i64"
          },
          {
            "name": "event_end",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "EventUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
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
      "name": "GpsCoords",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lat_micro",
            "type": "i32"
          },
          {
            "name": "lng_micro",
            "type": "i32"
          }
        ]
      }
    },
    {
      "name": "InitOrganizerParams",
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
            "name": "logo_uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "ListingAccount",
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
            "name": "escrow_ata",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "listed_at",
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
      "name": "ListingCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
            "type": "pubkey"
          },
          {
            "name": "ticket_pda",
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
      "name": "MintTicketParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tier_index",
            "type": "u8"
          },
          {
            "name": "metadata_uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "OperatorAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
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
      "name": "OperatorRemoved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
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
      "name": "OrganizerProfile",
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
            "name": "logo_uri",
            "type": "string"
          },
          {
            "name": "total_events",
            "type": "u32"
          },
          {
            "name": "total_tickets",
            "type": "u64"
          },
          {
            "name": "total_revenue",
            "type": "u64"
          },
          {
            "name": "total_royalties",
            "type": "u64"
          },
          {
            "name": "is_verified",
            "type": "bool"
          },
          {
            "name": "created_at",
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
      "name": "OrganizerVerified",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organizer_pda",
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
      "name": "PlatformConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "protocol_fee_bps",
            "type": "u16"
          },
          {
            "name": "fee_receiver",
            "type": "pubkey"
          },
          {
            "name": "creation_paused",
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
      "name": "PoapMinted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
            "type": "pubkey"
          },
          {
            "name": "ticket_pda",
            "type": "pubkey"
          },
          {
            "name": "poap_pda",
            "type": "pubkey"
          },
          {
            "name": "holder",
            "type": "pubkey"
          },
          {
            "name": "edition_number",
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
      "name": "PoapRecord",
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
            "name": "event_name",
            "type": "string"
          },
          {
            "name": "attended_at",
            "type": "i64"
          },
          {
            "name": "edition_number",
            "type": "u64"
          },
          {
            "name": "metadata_uri",
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
      "name": "RevenueWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
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
      "name": "TicketAccount",
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
            "name": "original_buyer",
            "type": "pubkey"
          },
          {
            "name": "ticket_number",
            "type": "u64"
          },
          {
            "name": "tier_index",
            "type": "u8"
          },
          {
            "name": "tier_type",
            "type": {
              "defined": {
                "name": "TierType"
              }
            }
          },
          {
            "name": "price_paid",
            "type": "u64"
          },
          {
            "name": "metadata_uri",
            "type": "string"
          },
          {
            "name": "is_checked_in",
            "type": "bool"
          },
          {
            "name": "checked_in_at",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "checked_in_by",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "poap_minted",
            "type": "bool"
          },
          {
            "name": "is_listed",
            "type": "bool"
          },
          {
            "name": "listed_price",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "resale_count",
            "type": "u8"
          },
          {
            "name": "transfer_count",
            "type": "u8"
          },
          {
            "name": "minted_at",
            "type": "i64"
          },
          {
            "name": "last_transferred_at",
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
      "name": "TicketCheckedIn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
            "type": "pubkey"
          },
          {
            "name": "ticket_pda",
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
            "name": "ticket_number",
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
      "name": "TicketListed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
            "type": "pubkey"
          },
          {
            "name": "ticket_pda",
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
      "name": "TicketMinted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
            "type": "pubkey"
          },
          {
            "name": "ticket_pda",
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
            "name": "ticket_number",
            "type": "u64"
          },
          {
            "name": "tier_index",
            "type": "u8"
          },
          {
            "name": "paid_lamports",
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
      "name": "TicketSold",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
            "type": "pubkey"
          },
          {
            "name": "ticket_pda",
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
            "name": "royalty_lamports",
            "type": "u64"
          },
          {
            "name": "resale_count",
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
      "name": "TicketTier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tier_type",
            "type": {
              "defined": {
                "name": "TierType"
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
            "name": "checked_in",
            "type": "u32"
          },
          {
            "name": "is_on_sale",
            "type": "bool"
          },
          {
            "name": "sale_start",
            "type": "i64"
          },
          {
            "name": "sale_end",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "TicketTransferred",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
            "type": "pubkey"
          },
          {
            "name": "ticket_pda",
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
            "name": "ticket_number",
            "type": "u64"
          },
          {
            "name": "transfer_count",
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
      "name": "TierType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "GeneralAdmission"
          },
          {
            "name": "EarlyBird"
          },
          {
            "name": "Vip"
          },
          {
            "name": "Vvip"
          },
          {
            "name": "Custom"
          }
        ]
      }
    },
    {
      "name": "UpdateEventParams",
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
            "name": "metadata_uri",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "event_start",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "event_end",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "resale_allowed",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "max_resale_price",
            "type": {
              "option": {
                "option": "u64"
              }
            }
          },
          {
            "name": "royalty_bps",
            "type": {
              "option": "u16"
            }
          }
        ]
      }
    },
    {
      "name": "WhitelistEntry",
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
            "name": "added_at",
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
      "name": "WhitelistEntryAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
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
      "name": "WhitelistEntryRemoved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event_pda",
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
} as const
