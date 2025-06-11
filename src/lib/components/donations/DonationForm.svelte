<script>
  import { createEventDispatcher } from 'svelte';
  import { loading, notifications } from '$lib/stores';
  import { validateDonationAmount, validatePhoneNumber, validateEmail } from '$lib/utils/validation.js';
  import { formatCurrency } from '$lib/utils/currency.js';
  import { paymentService } from '$lib/services/payment.js';
  import { Heart, CreditCard, Smartphone, User, Mail, MessageSquare, Eye, EyeOff } from 'lucide-svelte';
  
  export let project;
  export let showModal = false;
  
  const dispatch = createEventDispatcher();
  
  let formData = {
    amount: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    message: '',
    anonymous: true,
    paymentMethod: 'MPESA'
  };
  
  let errors = {};
  let step = 1; // 1: Amount, 2: Details, 3: Payment
  let showPersonalInfo = false;
  
  const quickAmounts = [10, 50, 100, 500, 1000, 2500];
  
  function validateStep1() {
    errors = {};
    
    const amountValidation = validateDonationAmount(formData.amount);
    if (!amountValidation.isValid) {
      errors.amount = amountValidation.error;
    }
    
    return Object.keys(errors).length === 0;
  }
  
  function validateStep2() {
    errors = {};
    
    if (!formData.anonymous) {
      if (formData.donorEmail && !validateEmail(formData.donorEmail)) {
        errors.donorEmail = 'Please enter a valid email address';
      }
    }
    
    if (formData.donorPhone && !validatePhoneNumber(formData.donorPhone)) {
      errors.donorPhone = 'Please enter a valid Kenyan phone number';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  function nextStep() {
    if (step === 1 && validateStep1()) {
      step = 2;
    } else if (step === 2 && validateStep2()) {
      step = 3;
    }
  }
  
  function prevStep() {
    if (step > 1) {
      step--;
    }
  }
  
  function selectAmount(amount) {
    formData.amount = amount.toString();
    errors.amount = '';
  }
  
  async function submitDonation() {
    if (!validateStep2()) return;

    loading.setPayment(true);

    try {
      // Step 1: Create donation record
      const donationResponse = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: project.id,
          amount: parseFloat(formData.amount),
          donorName: formData.anonymous ? null : formData.donorName,
          donorEmail: formData.anonymous ? null : formData.donorEmail,
          donorPhone: formData.donorPhone,
          message: formData.message,
          anonymous: formData.anonymous,
          paymentMethod: formData.paymentMethod
        })
      });

      const donationResult = await donationResponse.json();

      if (!donationResponse.ok || !donationResult.success) {
        throw new Error(donationResult.error || 'Failed to create donation record');
      }

      // Step 2: Initiate M-Pesa payment if required
      if (donationResult.requiresPayment && formData.paymentMethod === 'MPESA') {
        const paymentResponse = await paymentService.initiateMpesaPayment({
          amount: parseFloat(formData.amount),
          phoneNumber: formData.donorPhone,
          transactionId: donationResult.transactionId,
          description: `Donation for ${project.title}`
        });

        if (paymentResponse.success) {
          // Show success message and start polling for payment status
          notifications.add({
            type: 'info',
            title: 'Payment Initiated',
            message: 'Please check your phone and enter your M-Pesa PIN to complete the payment.'
          });

          // Start polling for payment status
          pollPaymentStatus(donationResult.transactionId, donationResult.receiptNumber);

        } else {
          throw new Error(paymentResponse.error || 'Failed to initiate M-Pesa payment');
        }
      } else {
        // Non-M-Pesa payment or no payment required
        notifications.add({
          type: 'success',
          title: 'Donation Successful!',
          message: `Thank you for your donation of ${formatCurrency(formData.amount)}. Receipt: ${donationResult.receiptNumber}`
        });

        dispatch('success', {
          donation: donationResult.donation,
          receiptNumber: donationResult.receiptNumber
        });

        closeModal();
      }

    } catch (error) {
      console.error('Donation error:', error);
      notifications.add({
        type: 'error',
        title: 'Donation Failed',
        message: error.message || 'Something went wrong. Please try again.'
      });
      loading.setPayment(false);
    }
  }

  // Poll payment status for M-Pesa payments
  async function pollPaymentStatus(transactionId, receiptNumber) {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)

    const poll = async () => {
      try {
        attempts++;

        const statusResponse = await paymentService.checkPaymentStatus(transactionId);

        if (statusResponse.success) {
          if (statusResponse.status === 'COMPLETED') {
            notifications.add({
              type: 'success',
              title: 'Payment Successful!',
              message: `Thank you for your donation of ${formatCurrency(formData.amount)}. Receipt: ${receiptNumber}`
            });

            dispatch('success', {
              donation: statusResponse,
              receiptNumber: receiptNumber
            });

            closeModal();
            loading.setPayment(false);
            return;

          } else if (statusResponse.status === 'FAILED' || statusResponse.status === 'CANCELLED' || statusResponse.status === 'TIMEOUT') {
            notifications.add({
              type: 'error',
              title: 'Payment Failed',
              message: statusResponse.message || 'Payment was not completed. Please try again.'
            });

            loading.setPayment(false);
            return;
          }
        }

        // Continue polling if payment is still pending
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          notifications.add({
            type: 'warning',
            title: 'Payment Status Unknown',
            message: 'Payment is taking longer than expected. Please check your M-Pesa messages or contact support.'
          });
          loading.setPayment(false);
        }

      } catch (error) {
        console.error('Payment status check error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Retry after 10 seconds
        } else {
          notifications.add({
            type: 'error',
            title: 'Payment Status Check Failed',
            message: 'Unable to verify payment status. Please contact support if payment was deducted.'
          });
          loading.setPayment(false);
        }
      }
    };

    // Start polling after 5 seconds
    setTimeout(poll, 5000);
  }
  
  function closeModal() {
    showModal = false;
    step = 1;
    formData = {
      amount: '',
      donorName: '',
      donorEmail: '',
      donorPhone: '',
      message: '',
      anonymous: true,
      paymentMethod: 'MPESA'
    };
    errors = {};
    dispatch('close');
  }
</script>

{#if showModal}
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">
            Donate to {project.title}
          </h2>
          <button
            on:click={closeModal}
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <!-- Progress Steps -->
        <div class="flex items-center mt-4 space-x-2">
          {#each [1, 2, 3] as stepNum}
            <div class="flex-1 h-2 rounded-full {step >= stepNum ? 'bg-emerald-500' : 'bg-gray-200'}"></div>
          {/each}
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>Amount</span>
          <span>Details</span>
          <span>Payment</span>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        {#if step === 1}
          <!-- Step 1: Amount -->
          <div class="space-y-6">
            <div>
              <label class="label">Donation Amount (KES)</label>
              <input
                type="number"
                placeholder="Enter amount (min. KES 2)"
                bind:value={formData.amount}
                class="input {errors.amount ? 'input-error' : ''}"
                min="2"
                step="1"
              />
              {#if errors.amount}
                <p class="error-text">{errors.amount}</p>
              {/if}
            </div>
            
            <!-- Quick Amount Buttons -->
            <div>
              <p class="text-sm text-gray-600 mb-3">Quick amounts:</p>
              <div class="grid grid-cols-3 gap-2">
                {#each quickAmounts as amount}
                  <button
                    type="button"
                    on:click={() => selectAmount(amount)}
                    class="btn btn-secondary text-sm py-2 {formData.amount === amount.toString() ? 'ring-2 ring-emerald-500' : ''}"
                  >
                    {formatCurrency(amount)}
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Project Info -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">{project.title}</h4>
              <div class="text-sm text-gray-600">
                <p>Goal: {formatCurrency(project.goalAmount)}</p>
                <p>Raised: {formatCurrency(project.currentAmount || 0)}</p>
              </div>
            </div>
          </div>
        {:else if step === 2}
          <!-- Step 2: Details -->
          <div class="space-y-6">
            <!-- Anonymous Toggle -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  bind:checked={formData.anonymous}
                  class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label for="anonymous" class="ml-2 text-sm font-medium text-gray-900">
                  Donate anonymously
                </label>
              </div>
              <button
                type="button"
                on:click={() => showPersonalInfo = !showPersonalInfo}
                class="text-emerald-600 hover:text-emerald-700"
              >
                {#if showPersonalInfo}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </button>
            </div>
            
            <!-- Personal Information (if not anonymous) -->
            {#if !formData.anonymous || showPersonalInfo}
              <div class="space-y-4">
                <div>
                  <label class="label">
                    <User class="h-4 w-4 mr-1" />
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    bind:value={formData.donorName}
                    class="input"
                  />
                </div>
                
                <div>
                  <label class="label">
                    <Mail class="h-4 w-4 mr-1" />
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    bind:value={formData.donorEmail}
                    class="input {errors.donorEmail ? 'input-error' : ''}"
                  />
                  {#if errors.donorEmail}
                    <p class="error-text">{errors.donorEmail}</p>
                  {/if}
                </div>
              </div>
            {/if}
            
            <!-- Phone Number -->
            <div>
              <label class="label">
                <Smartphone class="h-4 w-4 mr-1" />
                Phone Number (Required for M-Pesa)
              </label>
              <input
                type="tel"
                placeholder="+254 700 000 000"
                bind:value={formData.donorPhone}
                class="input {errors.donorPhone ? 'input-error' : ''}"
              />
              {#if errors.donorPhone}
                <p class="error-text">{errors.donorPhone}</p>
              {/if}
            </div>
            
            <!-- Message -->
            <div>
              <label class="label">
                <MessageSquare class="h-4 w-4 mr-1" />
                Message (Optional)
              </label>
              <textarea
                placeholder="Leave a message of support..."
                bind:value={formData.message}
                class="input resize-none"
                rows="3"
              ></textarea>
            </div>
          </div>
        {:else if step === 3}
          <!-- Step 3: Payment -->
          <div class="space-y-6">
            <!-- Payment Method -->
            <div>
              <label class="label">Payment Method</label>
              <div class="space-y-2">
                <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    bind:group={formData.paymentMethod}
                    value="MPESA"
                    class="text-emerald-600 focus:ring-emerald-500"
                  />
                  <Smartphone class="h-5 w-5 ml-2 mr-3 text-green-600" />
                  <span class="font-medium">M-Pesa</span>
                </label>
                <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                  <input
                    type="radio"
                    bind:group={formData.paymentMethod}
                    value="CARD"
                    disabled
                    class="text-emerald-600 focus:ring-emerald-500"
                  />
                  <CreditCard class="h-5 w-5 ml-2 mr-3 text-blue-600" />
                  <span class="font-medium">Credit/Debit Card</span>
                  <span class="ml-auto text-xs text-gray-500">Coming Soon</span>
                </label>
              </div>
            </div>
            
            <!-- Summary -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Donation Summary</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Amount:</span>
                  <span class="font-medium">{formatCurrency(formData.amount || 0)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Project:</span>
                  <span class="font-medium truncate ml-2">{project.title}</span>
                </div>
                <div class="flex justify-between">
                  <span>Payment:</span>
                  <span class="font-medium">{formData.paymentMethod}</span>
                </div>
                {#if formData.donorPhone}
                  <div class="flex justify-between">
                    <span>Phone:</span>
                    <span class="font-medium">{formData.donorPhone}</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Footer -->
      <div class="p-6 border-t border-gray-200 flex justify-between">
        {#if step > 1}
          <button
            type="button"
            on:click={prevStep}
            class="btn btn-secondary"
            disabled={$loading.payment}
          >
            Back
          </button>
        {:else}
          <div></div>
        {/if}
        
        {#if step < 3}
          <button
            type="button"
            on:click={nextStep}
            class="btn btn-primary"
          >
            Continue
          </button>
        {:else}
          <button
            type="button"
            on:click={submitDonation}
            class="btn btn-primary"
            disabled={$loading.payment || !formData.amount || !formData.donorPhone}
          >
            {#if $loading.payment}
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            {:else}
              <Heart class="h-4 w-4 mr-2" />
              Donate {formatCurrency(formData.amount || 0)}
            {/if}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
