# Current Affairs Quiz Application

A mobile-first, responsive quiz application with three modes: Manual Quiz, Auto-Slide Quiz, and Amazing Facts.

## ✨ New Features

- 🎵 **Background Music** - Royalty-free music with toggle control
- ⚙️ **Fully Configurable Timers** - Adjust all timing settings via config file
- 🎬 **Facts Auto-Slide** - Slideshow mode for facts with auto-reveal
- 🎨 **Enhanced Visuals** - Animated backgrounds, glowing effects, and smooth transitions
- 📱 **Mobile Optimized** - Perfect for portrait viewing like reels/shorts

## Features

### 3 Modes:
1. **Manual Quiz** - Take your time with configurable seconds per question
2. **Auto-Slide Quiz** - Questions auto-advance (configurable timing)
3. **Amazing Facts** - Learn interesting facts with reveal animations and auto-slide option

### Mobile-First Design
- Optimized for mobile devices (shorts/reels style)
- Fully responsive for desktop
- Smooth animations and transitions
- Touch-friendly interface

## ⚙️ Configuration

All timing and music settings are configurable in `config.txt`:

```
# Quiz Timer Settings
MANUAL_TIMER_DURATION=15              # Seconds per question in manual mode
AUTO_SLIDE_DURATION=8                 # Seconds per question in auto-slide mode
AUTO_SLIDE_ANSWER_DURATION=3          # Seconds to show answer

# Facts Settings
FACTS_AUTO_SLIDE=false                # Enable auto-slide for facts
FACTS_AUTO_SLIDE_DURATION=10          # Seconds per fact

# Music Settings
ENABLE_MUSIC=true                     # Enable background music
MUSIC_VOLUME=0.3                      # Volume (0.0 to 1.0)
```

**📖 For detailed feature documentation, see [FEATURES.md](FEATURES.md)**

## How to Use

### Adding Quiz Questions

Edit the `questions.txt` file with the following format:

```
Q[number]|Category|Question|Option1|Option2|Option3|Option4|CorrectOption(1-4)
```

**Example:**
```
Q1|Science|What is the speed of light?|300,000 km/s|150,000 km/s|450,000 km/s|600,000 km/s|1
Q2|History|When did World War II end?|1943|1944|1945|1946|3
```

**Notes:**
- Use `|` (pipe) as separator
- Number questions sequentially (Q1, Q2, Q3...)
- Correct option is 1, 2, 3, or 4
- No limit on number of questions
- Lines starting with `#` are comments

### Adding Facts

Edit the `facts.txt` file with the following format:

```
F[number]|Category|Question|Answer
```

**Example:**
```
F1|Space|How many moons does Mars have?|Mars has two small moons: Phobos and Deimos. Both were discovered in 1877.
F2|Nature|What is the tallest tree species?|Coast Redwoods can grow over 380 feet tall, making them the tallest trees on Earth.
```

### Configuration

Edit the `config.txt` file to adjust timing:

```
AUTO_SLIDE_DURATION=8
AUTO_SLIDE_ANSWER_DURATION=3
```

- `AUTO_SLIDE_DURATION` - Seconds per question in auto-slide mode
- `AUTO_SLIDE_ANSWER_DURATION` - Seconds to show answer before advancing

## File Structure

```
WebsiteCurrentAffairs/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── script.js           # JavaScript logic
├── questions.txt       # Quiz questions (EDIT THIS)
├── facts.txt          # Amazing facts (EDIT THIS)
├── config.txt         # Configuration (EDIT THIS)
└── README.md          # This file
```

## Usage Instructions

1. **Open the application** in a web browser
2. **Select a mode** from the sidebar (tap menu icon on mobile)
3. **Start the quiz** or browse facts
4. **Update content** by editing the `.txt` files
5. **Refresh** the page to see changes

## Tips

### For Mobile Users
- Use in portrait mode for best experience
- Sidebar accessible via menu button (top-left)
- Swipe gestures supported in facts mode

### For Desktop Users
- Sidebar is always visible
- Larger screen optimized layout
- Keyboard shortcuts: Arrow keys in facts mode

### Content Guidelines

**Questions:**
- Keep questions concise and clear
- Ensure only one correct answer
- Use varied categories for engagement
- Test all questions before deployment

**Facts:**
- Make answers informative and interesting
- Include specific details and numbers
- Break long answers into readable paragraphs
- Verify accuracy of information

## Troubleshooting

**Questions not loading?**
- Check `questions.txt` format (pipe separators)
- Ensure correct option numbers (1-4)
- Look for syntax errors in console

**Facts not showing?**
- Verify `facts.txt` format
- Check for proper pipe separators
- Ensure all fields are filled

**Timer issues?**
- Check `config.txt` values are numbers
- Ensure values are reasonable (1-60)
- Refresh page after config changes

## Browser Compatibility

- Chrome/Edge (recommended)
- Safari (iOS/macOS)
- Firefox
- Modern mobile browsers

## License

Free to use and modify for personal and educational purposes.

