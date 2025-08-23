// Simple educational chatbot for STEM simulations
// This provides immediate functionality without requiring external API keys

export interface ChatResponse {
  text: string;
  isError?: boolean;
}

export class EducationalChatbot {
  private moduleContext: string;
  private responses: Record<string, string[]>;
  private interactiveElements: Record<string, any>;
  private conversationHistory: string[] = [];

  constructor(moduleTitle: string) {
    this.moduleContext = moduleTitle;
    this.responses = this.initializeResponses();
    this.interactiveElements = this.initializeInteractiveElements();
  }

  private initializeResponses(): Record<string, string[]> {
    return {
      'DNA Replication': [
        "DNA replication is the process by which a cell makes an identical copy of its DNA. This happens during the S phase of the cell cycle.",
        "The double helix structure of DNA consists of two complementary strands. Adenine pairs with Thymine, and Guanine pairs with Cytosine.",
        "DNA polymerase is the enzyme responsible for adding new nucleotides to the growing DNA strand during replication.",
        "The leading strand is synthesized continuously, while the lagging strand is made in fragments called Okazaki fragments.",
        "DNA helicase unwinds the double helix, creating replication forks where new DNA can be synthesized."
      ],
      'Cell Division': [
        "Mitosis is the process of cell division that results in two identical daughter cells. It consists of six main phases.",
        "During interphase, the cell grows and replicates its DNA. This is the longest phase of the cell cycle.",
        "In prophase, chromosomes condense and become visible under a microscope. The nuclear envelope begins to break down.",
        "Metaphase is when chromosomes align at the cell equator, forming the metaphase plate.",
        "During anaphase, sister chromatids separate and move to opposite poles of the cell.",
        "In telophase, chromosomes decondense and nuclear envelopes reform around each set of chromosomes.",
        "Cytokinesis is the final step where the cytoplasm divides, creating two separate daughter cells."
      ],
      'Electromagnetism': [
        "Electromagnetic fields are created by electric charges and moving charges (currents).",
        "Electric fields exert forces on charged particles, while magnetic fields affect moving charges.",
        "Maxwell's equations describe how electric and magnetic fields interact and propagate as electromagnetic waves.",
        "The right-hand rule helps determine the direction of magnetic fields around current-carrying conductors.",
        "Electromagnetic induction occurs when a changing magnetic field induces an electric current in a conductor."
      ],
      'Orbital Mechanics': [
        "Orbital mechanics describes the motion of objects in space under the influence of gravitational forces.",
        "Kepler's three laws describe planetary motion: elliptical orbits, equal area law, and period-distance relationship.",
        "Newton's law of universal gravitation states that every mass attracts every other mass with a force proportional to their masses.",
        "The orbital period of a planet depends on its distance from the central star and the star's mass.",
        "Escape velocity is the minimum speed needed for an object to break free from a gravitational field."
      ]
    };
  }

  public async sendMessage(message: string): Promise<ChatResponse> {
    try {
      // Simple keyword-based responses
      const lowerMessage = message.toLowerCase();
      const responses = this.responses[this.moduleContext] || this.responses['DNA Replication'];
      
      // Check for specific keywords and provide relevant responses
      if (lowerMessage.includes('what') || lowerMessage.includes('explain') || lowerMessage.includes('how')) {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return { text: randomResponse };
      }
      
      if (lowerMessage.includes('dna') || lowerMessage.includes('replication')) {
        return { text: "DNA replication is a fundamental process where cells copy their genetic material. The double helix unwinds, and each strand serves as a template for creating a new complementary strand. This ensures that each daughter cell receives an identical copy of the genetic information." };
      }
      
      if (lowerMessage.includes('cell') || lowerMessage.includes('division') || lowerMessage.includes('mitosis')) {
        return { text: "Cell division through mitosis ensures that each daughter cell receives an identical set of chromosomes. This process is crucial for growth, repair, and reproduction in multicellular organisms." };
      }
      
      if (lowerMessage.includes('electric') || lowerMessage.includes('magnetic') || lowerMessage.includes('field')) {
        return { text: "Electromagnetic fields are fundamental forces in nature. Electric fields are created by stationary charges, while magnetic fields are produced by moving charges. Together, they form electromagnetic waves that carry energy and information." };
      }
      
      if (lowerMessage.includes('orbit') || lowerMessage.includes('planet') || lowerMessage.includes('gravity')) {
        return { text: "Orbital mechanics governs the motion of celestial bodies. Planets orbit stars due to gravitational attraction, following elliptical paths described by Kepler's laws. The balance between gravitational force and orbital velocity determines the shape and size of orbits." };
      }
      
      // Default response
      const defaultResponse = responses[0];
      return { text: defaultResponse };
      
    } catch (error) {
      console.error('Chatbot error:', error);
      return { 
        text: "I'm here to help you learn about " + this.moduleContext + "! Try asking me specific questions about the concepts you see in the simulation.", 
        isError: false 
      };
    }
  }

  private initializeInteractiveElements(): Record<string, any> {
    return {
      'DNA Replication': {
        'A (Adenine)': {
          description: "Adenine is one of the four nucleobases in DNA. It pairs with Thymine through two hydrogen bonds. Adenine is a purine base, meaning it has a double-ring structure.",
          facts: ["Forms 2 hydrogen bonds with Thymine", "Purine base with double-ring structure", "Essential for genetic coding"],
          questions: ["Why does Adenine pair with Thymine?", "What is the structure of Adenine?"]
        },
        'T (Thymine)': {
          description: "Thymine is a pyrimidine nucleobase that pairs with Adenine in DNA. It has a single-ring structure and forms two hydrogen bonds with Adenine.",
          facts: ["Forms 2 hydrogen bonds with Adenine", "Pyrimidine base with single-ring structure", "Only found in DNA, not RNA"],
          questions: ["How does Thymine differ from Uracil?", "Why is Thymine important in DNA?"]
        },
        'G (Guanine)': {
          description: "Guanine is a purine nucleobase that pairs with Cytosine in DNA. It forms three hydrogen bonds, making it the strongest base pair.",
          facts: ["Forms 3 hydrogen bonds with Cytosine", "Purine base with double-ring structure", "Strongest base pair in DNA"],
          questions: ["Why does Guanine form 3 hydrogen bonds?", "What makes Guanine-Cytosine pairs stronger?"]
        },
        'C (Cytosine)': {
          description: "Cytosine is a pyrimidine nucleobase that pairs with Guanine. It forms three hydrogen bonds and is essential for genetic stability.",
          facts: ["Forms 3 hydrogen bonds with Guanine", "Pyrimidine base with single-ring structure", "Can be methylated for gene regulation"],
          questions: ["What is cytosine methylation?", "How does Cytosine contribute to genetic stability?"]
        },
        'DNA Polymerase': {
          description: "DNA polymerase is the enzyme responsible for synthesizing new DNA strands during replication. It adds nucleotides to the growing strand in the 5' to 3' direction.",
          facts: ["Synthesizes DNA in 5' to 3' direction", "Has proofreading capability", "Requires a primer to start"],
          questions: ["Why does DNA polymerase need a primer?", "How does proofreading work?"]
        },
        'Helicase': {
          description: "DNA helicase unwinds the double helix by breaking hydrogen bonds between base pairs. This creates replication forks where new DNA can be synthesized.",
          facts: ["Breaks hydrogen bonds between bases", "Creates replication forks", "Requires ATP for energy"],
          questions: ["Why does helicase need ATP?", "What happens at replication forks?"]
        }
      },
      'Cell Division': {
        'Chromosome': {
          description: "Chromosomes are condensed DNA molecules that contain genetic information. During cell division, they become visible and are organized for proper distribution.",
          facts: ["Made of DNA and proteins", "Become visible during division", "Ensure equal genetic distribution"],
          questions: ["Why do chromosomes condense?", "How many chromosomes do humans have?"]
        },
        'Centromere': {
          description: "The centromere is the central region of a chromosome where sister chromatids are joined. It's the attachment point for spindle fibers.",
          facts: ["Joins sister chromatids", "Attachment point for spindle", "Essential for chromosome movement"],
          questions: ["What happens if centromeres don't work?", "How do spindle fibers attach?"]
        },
        'Spindle Fiber': {
          description: "Spindle fibers are microtubules that help move chromosomes during cell division. They attach to centromeres and pull chromosomes to opposite poles.",
          facts: ["Made of microtubules", "Attach to centromeres", "Pull chromosomes apart"],
          questions: ["How do spindle fibers form?", "What happens if spindle fibers fail?"]
        }
      },
      'Electromagnetism': {
        'Positive Charge': {
          description: "Positive charges create electric fields that point away from the charge. They attract negative charges and repel other positive charges.",
          facts: ["Creates outward electric field", "Attracts negative charges", "Repels positive charges"],
          questions: ["How do electric fields work?", "What causes positive charge?"]
        },
        'Negative Charge': {
          description: "Negative charges create electric fields that point toward the charge. They attract positive charges and repel other negative charges.",
          facts: ["Creates inward electric field", "Attracts positive charges", "Repels negative charges"],
          questions: ["How do electrons create charge?", "What is the unit of charge?"]
        },
        'Magnetic Field': {
          description: "Magnetic fields are created by moving charges and magnetic materials. They exert forces on other moving charges and magnetic objects.",
          facts: ["Created by moving charges", "Exerts forces on charges", "Has north and south poles"],
          questions: ["How do moving charges create magnetic fields?", "What are magnetic field lines?"]
        }
      },
      'Orbital Mechanics': {
        'Planet': {
          description: "Planets are celestial bodies that orbit stars. Their motion is governed by gravitational forces and follows Kepler's laws of planetary motion.",
          facts: ["Orbit around stars", "Follow Kepler's laws", "Have elliptical orbits"],
          questions: ["What are Kepler's laws?", "Why do planets orbit in ellipses?"]
        },
        'Sun': {
          description: "The Sun is the central star that provides gravitational force to keep planets in orbit. It's the primary source of energy in the solar system.",
          facts: ["Provides gravitational force", "Primary energy source", "Contains 99.8% of solar system mass"],
          questions: ["How does the Sun's gravity work?", "What fuels the Sun?"]
        },
        'Orbit': {
          description: "An orbit is the path that one object takes around another due to gravitational attraction. Orbits can be circular, elliptical, or other shapes.",
          facts: ["Path around central object", "Shaped by gravity", "Can be various shapes"],
          questions: ["What determines orbit shape?", "How do objects stay in orbit?"]
        }
      }
    };
  }

  public async sendMessage(message: string, clickedElement?: string): Promise<ChatResponse> {
    try {
      // If user clicked on an element, provide specific information about it
      if (clickedElement) {
        const elementInfo = this.interactiveElements[this.moduleContext]?.[clickedElement];
        if (elementInfo) {
          this.conversationHistory.push(`User clicked on: ${clickedElement}`);
          return {
            text: `You clicked on ${clickedElement}! ${elementInfo.description}\n\nKey facts:\n${elementInfo.facts.map(fact => `• ${fact}`).join('\n')}\n\nAsk me more about ${clickedElement} or explore other elements!`
          };
        }
      }

      // Add message to conversation history
      this.conversationHistory.push(message);
      
      // Simple keyword-based responses with enhanced interactivity
      const lowerMessage = message.toLowerCase();
      const responses = this.responses[this.moduleContext] || this.responses['DNA Replication'];
      
      // Check for specific keywords and provide relevant responses
      if (lowerMessage.includes('what') || lowerMessage.includes('explain') || lowerMessage.includes('how')) {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return { text: randomResponse };
      }
      
      if (lowerMessage.includes('dna') || lowerMessage.includes('replication')) {
        return { text: "DNA replication is a fundamental process where cells copy their genetic material. The double helix unwinds, and each strand serves as a template for creating a new complementary strand. This ensures that each daughter cell receives an identical copy of the genetic information." };
      }
      
      if (lowerMessage.includes('cell') || lowerMessage.includes('division') || lowerMessage.includes('mitosis')) {
        return { text: "Cell division through mitosis ensures that each daughter cell receives an identical set of chromosomes. This process is crucial for growth, repair, and reproduction in multicellular organisms." };
      }
      
      if (lowerMessage.includes('electric') || lowerMessage.includes('magnetic') || lowerMessage.includes('field')) {
        return { text: "Electromagnetic fields are fundamental forces in nature. Electric fields are created by stationary charges, while magnetic fields are produced by moving charges. Together, they form electromagnetic waves that carry energy and information." };
      }
      
      if (lowerMessage.includes('orbit') || lowerMessage.includes('planet') || lowerMessage.includes('gravity')) {
        return { text: "Orbital mechanics governs the motion of celestial bodies. Planets orbit stars due to gravitational attraction, following elliptical paths described by Kepler's laws. The balance between gravitational force and orbital velocity determines the shape and size of orbits." };
      }
      
      // Default response
      const defaultResponse = responses[0];
      return { text: defaultResponse };
      
    } catch (error) {
      console.error('Chatbot error:', error);
      return { 
        text: "I'm here to help you learn about " + this.moduleContext + "! Try asking me specific questions about the concepts you see in the simulation.", 
        isError: false 
      };
    }
  }

  public getWelcomeMessage(): string {
    return `Welcome to the ${this.moduleContext} simulation! I'm your AI learning assistant. 🧠\n\nI can help you with:\n• Click on any 3D element to learn about it\n• Ask questions about the concepts\n• Explain processes and mechanisms\n• Provide detailed information about components\n\nTry clicking on different elements or ask me anything!`;
  }
}

