# .dotfiles
This repository contains my dotfiles.

# Usage
Clone the repository to `~` and create symlinks from the repository. To keep the system up to date, all you have to do is sync the git repository.

## .bashrc
```
ln -s ~/.dotfiles/.bashrc ~/.bashrc
```

## .conkyrc
Need to have Conky installed `sudo apt install conky`. To setup Conky to run at startup, add `conky_startup.sh` to Startup Applications.

```
ln -s ~/.dotfiles/.conkyrc ~/.conkyrc
```

## .gitconfig
Create a symlink to ~

```
ln -s ~/.dotfiles/.gitconfig ~/.gitconfig
```

