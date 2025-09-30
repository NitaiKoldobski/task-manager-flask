def print_board(board):
    for row in board:
        for cell in row:
            print(f'{cell}  ', end='')
        print()


def a_move(board, player):
    while True:
        try:
            row = int(input(f'Player {player}, choose row (1-3): ')) - 1
            cell = int(input(f'Player {player}, choose cell (1-3): ')) - 1
            if row < 0 or row > 2 or cell < 0 or cell > 2:
                print('Out of range.. Choose numbers between 1-3')
            elif board[row][cell] != '_':
                print('This spot is already taken!')
            else:
                return row, cell
        except ValueError:
            print('Invalid input, please enter numbers only.')


def check_winner(board, player):

    for row in board:
        if all(cell == player for cell in row):
            return True

    for cell in range(3):
        if all(board[row][cell] == player for row in range(len(board[0]))):
            return True

    if all(board[i][i] == player for i in range(len(board[0]))) or \
       all(board[i][2-i] == player for i in range(len(board[0]))):
        return True
    return False


def check_draw(board):
    for row in board:
        if '_' in row:
            return False
    return True


def play_game():
    board = [['_', '_', '_'],
             ['_', '_', '_'],
             ['_', '_', '_']]
    print_board(board)

    current_player = "X"

    while True:
        r, c = a_move(board, current_player)
        board[r][c] = current_player
        print(f"\nAfter Player {current_player} move:")
        print_board(board)

        if check_winner(board, current_player):
            print(f"Player {current_player} wins!")
            break
        elif check_draw(board):
            print("It's a draw!")
            break

        current_player = "O" if current_player == "X" else "X"



while True:
    play_game()
    again = input('\nDo you want to play again? (y/n): ').lower()
    if again != 'y':
        print('thnx for playing byeeeee')
        break
