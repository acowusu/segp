# SadTalker

## Installation

1. Clone the repository `git clone [repository URL]`
2. Navigate to `./server` directory

## Setup

1. Clone the SadTalker repo into the directory

```bash
./clone_sadtalker_repo.sh
cd SadTalker
```

2. Create and activate the sadtalker conda environment

```python
conda activate sadtalker
```

3. Download the models into the Sadtalker repository

```bash
./scripts/download_models.sh
```

## Usage

1. Run sadtalker_main.py

```python
python3 sadtalker_main.py
```

Generated outputs are saved in /www
